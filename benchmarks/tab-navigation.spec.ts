import { expect, test, type Page } from '@playwright/test'

/**
 * Chromium CDP presets aligned with common DevTools/Lighthouse-style cellular
 * throughput (bytes/s) and minimum RTT (ms). Used only for benchmark runs.
 */
const CDP_FAST_4G = {
  offline: false,
  downloadThroughput: (9 * 1024 * 1024) / 8,
  uploadThroughput: (4 * 1024 * 1024) / 8,
  latency: 20,
  connectionType: 'cellular4g' as const,
}

const CDP_SLOW_4G = {
  offline: false,
  downloadThroughput: (1.5 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
  connectionType: 'cellular4g' as const,
}

async function emulateNetwork(
  page: Page,
  preset: typeof CDP_FAST_4G | typeof CDP_SLOW_4G,
): Promise<void> {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', preset)
}

const TAB_PATHS = [
  '/home',
  '/risk-per-domain',
  '/contacts',
  '/reports',
  '/external-risks',
  '/workflows',
  '/library',
] as const

type TabPath = (typeof TAB_PATHS)[number]

const EXPECTED_MOUNTED_BY_TAB: Record<TabPath, string[]> = {
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

const TAB_LABEL: Record<TabPath, string> = {
  '/home': 'Home',
  '/risk-per-domain': 'Risk Per Domain',
  '/contacts': 'Contacts',
  '/reports': 'Reports',
  '/external-risks': 'External Risks',
  '/workflows': 'Workflows',
  '/library': 'Library',
}

const VISITS_PER_TAB = 10

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace<T>(arr: T[], rand: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function buildPseudoRandomSequence(seed: number): TabPath[] {
  const seq: TabPath[] = []
  const rand = mulberry32(seed)
  for (const path of TAB_PATHS) {
    for (let k = 0; k < VISITS_PER_TAB; k++) seq.push(path)
  }
  shuffleInPlace(seq, rand)
  return seq
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(v)
}

function scoreForMs(ms: number): string {
  if (ms < 3000) return 'Good'
  if (ms < 5000) return 'Medium'
  if (ms < 7000) return 'Low'
  return 'Fail'
}

/** Subscribe before navigation so synchronous onMounted logs are not missed. */
function subscribeMountedComplete(
  page: Page,
  expected: string[],
  startTime: number,
  timeoutMs: number,
): Promise<number> {
  const pending = new Set(expected)
  return new Promise<number>((resolve, reject) => {
    const handler = (msg: { text: () => string }) => {
      const text = msg.text()
      const m = /^onMounted (.+)$/.exec(text)
      if (!m) return
      const name = m[1]
      if (pending.has(name)) {
        pending.delete(name)
        if (pending.size === 0) {
          page.off('console', handler)
          clearTimeout(timer)
          resolve(performance.now() - startTime)
        }
      }
    }
    page.on('console', handler)
    const timer = setTimeout(() => {
      page.off('console', handler)
      reject(
        new Error(
          `Timeout after ${timeoutMs}ms. Still waiting for: ${[...pending].join(', ')}`,
        ),
      )
    }, timeoutMs)
  })
}

async function goToTab(page: Page, path: TabPath, samples: TabSample[]): Promise<void> {
  const url = page.url()
  const onTarget = url.endsWith(path) || url.includes(`${path}?`) || url.includes(`${path}#`)
  if (onTarget) {
    const pivot = path === '/home' ? '/library' : '/home'
    await page.goto(pivot)
    await page.waitForURL(`**${pivot}`)
  }
  const expected = EXPECTED_MOUNTED_BY_TAB[path]
  const start = performance.now()
  const mountedPromise = subscribeMountedComplete(page, expected, start, 30_000)
  await page.goto(path)
  await page.waitForURL(`**${path}`)
  const elapsedMs = await mountedPromise
  samples.push({ tab: path, ms: elapsedMs })
}

interface TabSample {
  tab: TabPath
  ms: number
}

function printResultsTable(profile: string, samples: TabSample[]): void {
  const byTab = new Map<TabPath, number[]>()
  for (const p of TAB_PATHS) byTab.set(p, [])
  for (const s of samples) {
    byTab.get(s.tab)?.push(s.ms)
  }

  const allMs = samples.map((s) => s.ms)
  const rows: { label: string; ms: number[] }[] = [
    { label: 'All tabs combined', ms: allMs },
    ...TAB_PATHS.map((p) => ({ label: TAB_LABEL[p], ms: byTab.get(p) ?? [] })),
  ]

  console.log(`\n=== Tab navigation benchmark — ${profile} (ms) ===\n`)
  console.log(
    '| Scope | Avg (ms) | Min | Max | Std dev | Score |\n|---|---:|---:|---:|---:|---|',
  )
  for (const { label, ms } of rows) {
    const avg = mean(ms)
    const mn = Math.min(...ms)
    const mx = Math.max(...ms)
    const sd = stdDev(ms)
    console.log(
      `| ${label} | ${avg.toFixed(1)} | ${mn.toFixed(1)} | ${mx.toFixed(1)} | ${sd.toFixed(1)} | ${scoreForMs(avg)} |`,
    )
  }
  console.log('')
}

async function collectTabNavigationSamples(page: Page): Promise<TabSample[]> {
  const samples: TabSample[] = []
  await page.goto('/home')
  await page.waitForURL('**/home')

  const sequence = buildPseudoRandomSequence(0x4e17_2026)
  for (const path of sequence) {
    await goToTab(page, path, samples)
  }
  return samples
}

test.describe('tab navigation mount latency', () => {
  test('Fast 4G throttling', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Network throttling uses Chromium CDP')
    test.setTimeout(600_000)
    await emulateNetwork(page, CDP_FAST_4G)
    const samples = await collectTabNavigationSamples(page)
    printResultsTable('Fast 4G', samples)
    for (const s of samples.map((x) => x.ms)) {
      expect(s).toBeLessThan(120_000)
    }
  })

  test('Slow 4G throttling', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Network throttling uses Chromium CDP')
    test.setTimeout(600_000)
    await emulateNetwork(page, CDP_SLOW_4G)
    const samples = await collectTabNavigationSamples(page)
    printResultsTable('Slow 4G', samples)
    for (const s of samples.map((x) => x.ms)) {
      expect(s).toBeLessThan(180_000)
    }
  })
})
