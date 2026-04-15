/**
 * Measures tab navigation: click → first `Mounted …` console line from vh-main content.
 * Requires dev server (default http://127.0.0.1:5173). Run: npm run dev (separate terminal) then npm run benchmark:tabs
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173'

const TABS = [
  { label: 'Home', path: '/home', mountMatch: 'Mounted HomeView' },
  { label: 'Risk Per Domain', path: '/risk-per-domain', mountMatch: 'Mounted Risk Per Domain' },
  { label: 'Contacts', path: '/contacts', mountMatch: 'Mounted Contacts' },
  { label: 'Reports', path: '/reports', mountMatch: 'Mounted Reports' },
  { label: 'External Risks', path: '/external-risks', mountMatch: 'Mounted External Risks' },
  { label: 'Workflows', path: '/workflows', mountMatch: 'Mounted Workflows' },
  { label: 'Library', path: '/library', mountMatch: 'Mounted Library' },
]

const VISITS_PER_TAB = 10

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildPseudoRandomSequence(rng) {
  const counts = Object.fromEntries(TABS.map((t) => [t.path, 0]))
  const sequence = []
  let lastPath = null
  const total = TABS.length * VISITS_PER_TAB

  for (let i = 0; i < total; i++) {
    let candidates = TABS.filter((t) => counts[t.path] < VISITS_PER_TAB && t.path !== lastPath)
    if (candidates.length === 0) {
      candidates = TABS.filter((t) => counts[t.path] < VISITS_PER_TAB)
    }
    const pick = candidates[Math.floor(rng() * candidates.length)]
    sequence.push(pick)
    counts[pick.path]++
    lastPath = pick.path
  }

  for (const t of TABS) {
    if (counts[t.path] !== VISITS_PER_TAB) {
      throw new Error(`Invariant failed: ${t.label} has ${counts[t.path]} visits`)
    }
  }
  return sequence
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function stddev(arr) {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const v = mean(arr.map((x) => (x - m) ** 2))
  return Math.sqrt(v)
}

function scoreLabel(ms) {
  if (ms < 3000) return 'Good'
  if (ms < 5000) return 'Medium'
  if (ms < 7000) return 'Low'
  return 'Fail'
}

function waitForMountLog(page, expectedText, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('console', onConsole)
      reject(new Error(`Timeout waiting for mount: ${expectedText}`))
    }, timeoutMs)

    function onConsole(msg) {
      if (msg.type() !== 'log') return
      const text = msg.text()
      if (text === expectedText) {
        clearTimeout(timer)
        page.off('console', onConsole)
        resolve()
      }
    }
    page.on('console', onConsole)
  })
}

async function measureNavigation(page, tab) {
  const mountWait = waitForMountLog(page, tab.mountMatch)
  const t0 = performance.now()
  await page.getByRole('navigation', { name: 'Vendor hub tabs' }).getByRole('link', { name: tab.label }).click()
  await mountWait
  return performance.now() - t0
}

function fmtMs(n) {
  return `${n.toFixed(1)} ms`
}

async function main() {
  const rng = mulberry32(0x9e3779b9)
  const sequence = buildPseudoRandomSequence(rng)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.on('pageerror', (e) => console.error('pageerror', e))

  const first = sequence[0]
  const bootstrap = TABS.find((t) => t.path !== first.path) ?? TABS[0]
  const bootDone = waitForMountLog(page, bootstrap.mountMatch)
  await page.goto(`${BASE_URL}${bootstrap.path}`, { waitUntil: 'domcontentloaded' })
  await bootDone

  const byTab = Object.fromEntries(TABS.map((t) => [t.label, []]))
  const all = []

  for (const tab of sequence) {
    const ms = await measureNavigation(page, tab)
    all.push(ms)
    byTab[tab.label].push(ms)
  }

  await browser.close()

  const rows = []

  const overallAvg = mean(all)
  rows.push({
    scope: 'All tabs (combined)',
    n: all.length,
    avg: overallAvg,
    min: Math.min(...all),
    max: Math.max(...all),
    std: stddev(all),
    score: scoreLabel(overallAvg),
  })

  for (const t of TABS) {
    const samples = byTab[t.label]
    const avg = mean(samples)
    rows.push({
      scope: t.label,
      n: samples.length,
      avg,
      min: Math.min(...samples),
      max: Math.max(...samples),
      std: stddev(samples),
      score: scoreLabel(avg),
    })
  }

  const pad = (s, w) => String(s).padEnd(w)
  const header = `${pad('Scope', 28)} | ${pad('n', 4)} | ${pad('Avg', 12)} | ${pad('Min', 12)} | ${pad('Max', 12)} | ${pad('Std dev', 12)} | Score`
  const sep = '-'.repeat(header.length)
  let out = '\nTab navigation benchmark (pseudo-random order, each tab ×10)\n'
  out += `Criteria: Good <3s | Medium <5s | Low <7s | Fail ≥7s\n\n`
  out += `${header}\n${sep}\n`
  for (const r of rows) {
    out += `${pad(r.scope, 28)} | ${pad(r.n, 4)} | ${pad(fmtMs(r.avg), 12)} | ${pad(fmtMs(r.min), 12)} | ${pad(fmtMs(r.max), 12)} | ${pad(fmtMs(r.std), 12)} | ${r.score}\n`
  }
  console.log(out)

  const mdTable =
    `| Scope | n | Average | Min | Max | Std dev | Score |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n` +
    rows
      .map(
        (r) =>
          `| ${r.scope} | ${r.n} | ${r.avg.toFixed(1)} | ${r.min.toFixed(1)} | ${r.max.toFixed(1)} | ${r.std.toFixed(1)} | ${r.score} |`,
      )
      .join('\n')

  return { text: out.trim(), mdTable, rows }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
