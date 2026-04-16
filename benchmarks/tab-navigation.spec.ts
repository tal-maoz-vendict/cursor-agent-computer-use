import { expect, test, type CDPSession, type Page } from '@playwright/test'

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

/** Chrome DevTools-style presets (bytes/s throughput, ms latency). */
const NETWORK_PRESETS = {
  'Fast 4G': {
    latency: 165,
    downloadThroughput: 1_012_500,
    uploadThroughput: 168_750,
  },
  'Slow 4G': {
    latency: 562.5,
    downloadThroughput: 180_000,
    uploadThroughput: 84_375,
  },
} as const

async function applyNetworkThrottling(
  page: Page,
  preset: (typeof NETWORK_PRESETS)[keyof typeof NETWORK_PRESETS],
): Promise<CDPSession> {
  const session = await page.context().newCDPSession(page)
  await session.send('Network.enable')
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: preset.latency,
    downloadThroughput: preset.downloadThroughput,
    uploadThroughput: preset.uploadThroughput,
    connectionType: 'cellular4g',
  })
  return session
}

async function clearNetworkThrottling(session: CDPSession): Promise<void> {
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
    connectionType: 'none',
  })
  await session.detach()
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

function printResultsTable(profileLabel: string, samples: TabSample[]): void {
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

  console.log(`\n=== Tab navigation: ${profileLabel} (start → last onMounted in .vh-main, ms) ===\n`)
  console.log(
    '| Scope | Avg (ms) | Min | Max | Std dev | Score |\n|---|---:|---:|---:|---:|---:|',
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

async function collectSamples(page: Page): Promise<TabSample[]> {
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
  test('Fast 4G throttling', async ({ page }) => {
    test.setTimeout(600_000)
    const cdp = await applyNetworkThrottling(page, NETWORK_PRESETS['Fast 4G'])
    try {
      const samples = await collectSamples(page)
      printResultsTable('Fast 4G', samples)
      for (const s of samples) {
        expect(s.ms).toBeLessThan(120_000)
      }
    } finally {
      await clearNetworkThrottling(cdp)
    }
  })

  test('Slow 4G throttling', async ({ page }) => {
    test.setTimeout(600_000)
    const cdp = await applyNetworkThrottling(page, NETWORK_PRESETS['Slow 4G'])
    try {
      const samples = await collectSamples(page)
      printResultsTable('Slow 4G', samples)
      for (const s of samples) {
        expect(s.ms).toBeLessThan(120_000)
      }
    } finally {
      await clearNetworkThrottling(cdp)
    }
  })
})
