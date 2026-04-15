/**
 * Measures tab navigation: time from sidebar click until all vh-main route
 * components log "Mounted <name>" (see HomeView / PlaceholderView tree).
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        BASE_URL=http://127.0.0.1:4173 npm run benchmark:tab-nav
 */

import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const PREVIEW_START_TIMEOUT_MS = 60_000
const NAV_TIMEOUT_MS = 120_000

/** @type {Record<string, string[]>} */
const EXPECTED_MOUNTS = {
  '/home': [
    'HomeView',
    'VendorHeader',
    'VendorProfileCard',
    'VendorScoreGrid',
    'VendorDetailsGrid',
    'VendorProjectsSection',
  ],
  '/risk-per-domain': ['PlaceholderView'],
  '/contacts': ['PlaceholderView'],
  '/reports': ['PlaceholderView'],
  '/external-risks': ['PlaceholderView'],
  '/workflows': ['PlaceholderView'],
  '/library': ['PlaceholderView'],
}

const TABS = Object.keys(EXPECTED_MOUNTS)

/** Chrome-ish CDP: bytes per second + latency ms */
const THROTTLE_PRESETS = {
  'Fast 4G': {
    offline: false,
    downloadThroughput: (1.5 * 1_000_000) / 8,
    uploadThroughput: (750 * 1_000) / 8,
    latency: 20,
  },
  'Slow 4G': {
    offline: false,
    downloadThroughput: (400 * 1_000) / 8,
    uploadThroughput: (400 * 1_000) / 8,
    latency: 150,
  },
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 70 navigations: each tab exactly 10 times, pseudo-random order,
 * no two consecutive visits to the same tab.
 */
function buildNavigationSequence() {
  const out = []
  for (let rep = 0; rep < 10; rep++) {
    const block = shuffleInPlace([...TABS])
    if (out.length > 0 && block[0] === out[out.length - 1]) {
      const swapIdx = block.findIndex((p) => p !== out[out.length - 1])
      if (swapIdx > 0) {
        ;[block[0], block[swapIdx]] = [block[swapIdx], block[0]]
      }
    }
    out.push(...block)
  }
  return out
}

function mean(values) {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdSample(values) {
  if (values.length < 2) return 0
  const m = mean(values)
  const v =
    values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(v)
}

function scoreFromSeconds(seconds) {
  if (seconds < 3) return 'Good'
  if (seconds < 5) return 'Medium'
  if (seconds < 7) return 'Low'
  return 'Fail'
}

function formatMs(ms) {
  return `${(ms / 1000).toFixed(3)} s`
}

function markdownTable(headers, rows) {
  const esc = (c) => String(c).replace(/\|/g, '\\|')
  const lines = []
  lines.push(`| ${headers.map(esc).join(' | ')} |`)
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`)
  for (const row of rows) {
    lines.push(`| ${row.map(esc).join(' | ')} |`)
  }
  return lines.join('\n')
}

/**
 * @param {import('playwright').Page} page
 * @param {string} targetPath
 * @param {number} startPerf
 */
function waitForExpectedMounts(page, targetPath, startPerf) {
  const expected = EXPECTED_MOUNTS[targetPath]
  const missing = new Set(expected)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('console', onConsole)
      reject(
        new Error(
          `Timeout waiting for mounts to ${targetPath}. Still missing: ${[...missing].join(', ')}`,
        ),
      )
    }, NAV_TIMEOUT_MS)

    /** @param {import('playwright').ConsoleMessage} msg */
    function onConsole(msg) {
      if (msg.type() !== 'log') return
      const text = msg.text()
      const m = text.match(/^Mounted (.+)$/)
      if (!m) return
      const name = m[1]
      if (!missing.has(name)) return
      missing.delete(name)
      if (missing.size === 0) {
        clearTimeout(timer)
        page.off('console', onConsole)
        page
          .evaluate(() => performance.now())
          .then((endPerf) => resolve(endPerf - startPerf))
      }
    }

    page.on('console', onConsole)
  })
}

async function ensurePreviewRunning() {
  try {
    const res = await fetch(BASE_URL, { method: 'GET' })
    if (res.ok) return
  } catch {
    // fall through
  }

  console.error(`No server at ${BASE_URL}. Starting vite preview...`)
  const child = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    stdio: 'inherit',
    detached: true,
  })
  child.unref()

  const deadline = Date.now() + PREVIEW_START_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL, { method: 'GET' })
      if (res.ok) {
        console.error(`Preview ready at ${BASE_URL}`)
        return
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error(`Preview did not become ready at ${BASE_URL} within ${PREVIEW_START_TIMEOUT_MS}ms`)
}

/**
 * @param {import('playwright').BrowserContext} context
 * @param {import('playwright').Page} page
 * @param {string} label
 */
async function applyThrottle(context, page, label) {
  const session = await context.newCDPSession(page)
  const conditions = THROTTLE_PRESETS[label]
  if (!conditions) throw new Error(`Unknown throttle: ${label}`)
  await session.send('Network.enable')
  await session.send('Network.emulateNetworkConditions', conditions)
}

/**
 * @param {import('playwright').Page} page
 * @param {string} targetPath
 */
async function clickTabAndWaitForMounts(page, targetPath) {
  const selector = `.vh-sidebar-nav a.vh-nav-item[href="${targetPath}"]`
  const handle = page.locator(selector).first()
  await handle.waitFor({ state: 'visible', timeout: 30_000 })

  const startPerf = await page.evaluate(() => performance.now())
  const mountPromise = waitForExpectedMounts(page, targetPath, startPerf)
  await handle.click({ timeout: 10_000 })
  return mountPromise
}

/**
 * @param {import('playwright').Page} page
 */
async function ensureNotOnPath(page, path) {
  const current = new URL(page.url()).pathname
  if (current !== path) return
  const alt = TABS.find((t) => t !== path)
  if (!alt) return
  await clickTabAndWaitForMounts(page, alt)
}

/**
 * @param {string} throttleLabel
 * @param {Map<string, number[]>} byTab
 * @param {number[]} all
 */
function printResultsTable(throttleLabel, byTab, all) {
  console.log(`\n## ${throttleLabel}\n`)

  const combinedAvg = mean(all)
  const combinedRow = [
    '**All tabs**',
    formatMs(combinedAvg),
    formatMs(Math.min(...all)),
    formatMs(Math.max(...all)),
    formatMs(stdSample(all)),
    scoreFromSeconds(combinedAvg / 1000),
  ]

  const tabRows = TABS.map((path) => {
    const samples = byTab.get(path) ?? []
    const avg = mean(samples)
    return [
      path,
      formatMs(avg),
      formatMs(Math.min(...samples)),
      formatMs(Math.max(...samples)),
      samples.length < 2 ? '0.000 s' : formatMs(stdSample(samples)),
      scoreFromSeconds(avg / 1000),
    ]
  })

  const headers = ['Scope', 'Average', 'Min', 'Max', 'Std dev', 'Score']
  console.log(markdownTable(headers, [combinedRow, ...tabRows]))
}

async function runSuite(throttleLabel) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  await applyThrottle(context, page, throttleLabel)

  await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForSelector('.vh-sidebar-nav', { timeout: 30_000 })

  const sequence = buildNavigationSequence()
  /** @type {Map<string, number[]>} */
  const byTab = new Map()
  for (const t of TABS) byTab.set(t, [])
  const all = []

  await ensureNotOnPath(page, sequence[0])

  for (const path of sequence) {
    const dt = await clickTabAndWaitForMounts(page, path)
    byTab.get(path).push(dt)
    all.push(dt)
  }

  await browser.close()
  printResultsTable(throttleLabel, byTab, all)
}

async function main() {
  await ensurePreviewRunning()

  for (const label of ['Fast 4G', 'Slow 4G']) {
    await runSuite(label)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
