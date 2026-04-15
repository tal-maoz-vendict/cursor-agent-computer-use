/**
 * Measures tab navigation: time from sidebar click until every component
 * in vh-main has logged `Mounted <ComponentName>`.
 *
 * Run with dev server: npm run dev (then: npm run benchmark:tabs)
 */

import { chromium } from 'playwright'

const TABS = [
  { key: 'Home', label: 'Home', path: '/home', expected: ['Mounted HomeView', 'Mounted VendorHeader', 'Mounted VendorProfileCard', 'Mounted VendorScoreGrid', 'Mounted VendorDetailsGrid', 'Mounted VendorProjectsSection'] },
  { key: 'Risk Per Domain', label: 'Risk Per Domain', path: '/risk-per-domain', expected: ['Mounted PlaceholderView'] },
  { key: 'Contacts', label: 'Contacts', path: '/contacts', expected: ['Mounted PlaceholderView'] },
  { key: 'Reports', label: 'Reports', path: '/reports', expected: ['Mounted PlaceholderView'] },
  { key: 'External Risks', label: 'External Risks', path: '/external-risks', expected: ['Mounted PlaceholderView'] },
  { key: 'Workflows', label: 'Workflows', path: '/workflows', expected: ['Mounted PlaceholderView'] },
  { key: 'Library', label: 'Library', path: '/library', expected: ['Mounted PlaceholderView'] },
]

const HOME_TAB = TABS[0]
const LIBRARY_TAB = TABS[TABS.length - 1]

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'
const VISITS_PER_TAB = 10

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleDeterministic(indices, rand) {
  const a = [...indices]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildVisitSequence() {
  const indices = []
  for (let i = 0; i < TABS.length; i++) {
    for (let v = 0; v < VISITS_PER_TAB; v++) indices.push(i)
  }
  const rand = mulberry32(0x5ca1ab1e)
  return shuffleDeterministic(indices, rand).map((i) => TABS[i])
}

function mean(arr) {
  return arr.reduce((s, x) => s + x, 0) / arr.length
}

function stdDev(arr) {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const v = mean(arr.map((x) => (x - m) ** 2))
  return Math.sqrt(v)
}

function scoreMs(ms) {
  if (ms < 3000) return 'Good'
  if (ms < 5000) return 'Medium'
  if (ms < 7000) return 'Low'
  return 'Fail'
}

function formatMs(ms) {
  return `${ms.toFixed(0)} ms`
}

function tabLink(page, label) {
  return page.getByRole('navigation', { name: 'Vendor hub tabs' }).getByRole('link', { name: label })
}

async function waitForMounted(page, need, timeout = 120_000) {
  await page.waitForFunction(
    ({ messages }) => {
      const w = window
      if (!w.__tabNavSeen) w.__tabNavSeen = new Set()
      return messages.every((m) => w.__tabNavSeen.has(m))
    },
    { messages: need },
    { timeout },
  )
}

/** If target is already the active route, Vue will not remount; hop away first (not timed). */
async function ensureRouteChangeBeforeMeasure(page, targetTab) {
  const pathname = new URL(page.url()).pathname
  if (pathname !== targetTab.path) return

  const pivot = targetTab.path === HOME_TAB.path ? LIBRARY_TAB : HOME_TAB
  await tabLink(page, pivot.label).click()
  await waitForMounted(page, pivot.expected)
}

async function measureNavigation(page, tab) {
  await ensureRouteChangeBeforeMeasure(page, tab)

  await page.evaluate(() => {
    window.__tabNavSeen = new Set()
  })

  const start = await page.evaluate(() => performance.now())
  await tabLink(page, tab.label).click()
  await waitForMounted(page, tab.expected)
  const end = await page.evaluate(() => performance.now())

  return end - start
}

async function main() {
  const sequence = buildVisitSequence()
  const byTab = Object.fromEntries(TABS.map((t) => [t.key, []]))
  const all = []

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.addInitScript(() => {
    const orig = console.log.bind(console)
    console.log = (...args) => {
      orig(...args)
      const w = window
      if (!w.__tabNavSeen) w.__tabNavSeen = new Set()
      const first = args[0]
      if (typeof first === 'string' && first.startsWith('Mounted ')) {
        w.__tabNavSeen.add(first)
      }
    }
  })

  await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle' })

  await page.waitForFunction(() => {
    const w = window
    const need = [
      'Mounted HomeView',
      'Mounted VendorHeader',
      'Mounted VendorProfileCard',
      'Mounted VendorScoreGrid',
      'Mounted VendorDetailsGrid',
      'Mounted VendorProjectsSection',
    ]
    return w.__tabNavSeen && need.every((m) => w.__tabNavSeen.has(m))
  })

  for (const tab of sequence) {
    const ms = await measureNavigation(page, tab)
    all.push(ms)
    byTab[tab.key].push(ms)
  }

  await browser.close()

  const overall = {
    avg: mean(all),
    min: Math.min(...all),
    max: Math.max(...all),
    sd: stdDev(all),
    score: scoreMs(mean(all)),
  }

  console.log('\n## Tab navigation benchmark\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Visits per tab: ${VISITS_PER_TAB} (total navigations: ${all.length})`)
  console.log('Timing: single click into target tab until all `Mounted …` logs for that view; if target was already active, an untimed hop to Home/Library ensures a real navigation.\n')

  console.log('| Scope | Avg | Min | Max | Std dev | Score |')
  console.log('| --- | ---: | ---: | ---: | ---: | --- |')
  console.log(
    `| **All tabs** | ${formatMs(overall.avg)} | ${formatMs(overall.min)} | ${formatMs(overall.max)} | ${formatMs(overall.sd)} | ${overall.score} |`,
  )

  for (const tab of TABS) {
    const arr = byTab[tab.key]
    const avg = mean(arr)
    const row = `| ${tab.key} | ${formatMs(avg)} | ${formatMs(Math.min(...arr))} | ${formatMs(Math.max(...arr))} | ${formatMs(stdDev(arr))} | ${scoreMs(avg)} |`
    console.log(row)
  }

  console.log('\nScore thresholds: Good < 3s, Medium < 5s, Low < 7s, Fail ≥ 7s.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
