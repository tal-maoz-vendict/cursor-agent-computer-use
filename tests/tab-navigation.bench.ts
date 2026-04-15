import { expect, test, type Locator, type Page } from '@playwright/test'

/** Seeded PRNG (Mulberry32) for reproducible pseudo-random tab order */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace<T>(arr: T[], rand: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
}

const TAB_DEFINITIONS = [
  { label: 'Home', path: '/home', display: 'Home' },
  { label: 'Risk Per Domain', path: '/risk-per-domain', display: 'Risk Per Domain' },
  { label: 'Contacts', path: '/contacts', display: 'Contacts' },
  { label: 'Reports', path: '/reports', display: 'Reports' },
  { label: 'External Risks', path: '/external-risks', display: 'External Risks' },
  { label: 'Workflows', path: '/workflows', display: 'Workflows' },
  { label: 'Library', path: '/library', display: 'Library' },
] as const

const HOME_MOUNTS = new Set([
  'HomeView',
  'VendorHeader',
  'VendorProfileCard',
  'VendorScoreGrid',
  'VendorDetailsGrid',
  'VendorProjectsSection',
])

const PLACEHOLDER_MOUNTS = new Set(['PlaceholderView'])

function expectedMountsForPath(path: string): Set<string> {
  return path === '/home' ? HOME_MOUNTS : PLACEHOLDER_MOUNTS
}

function scoreFromSeconds(seconds: number): 'Good' | 'Medium' | 'Low' | 'Fail' {
  if (seconds < 3) return 'Good'
  if (seconds < 5) return 'Medium'
  if (seconds < 7) return 'Low'
  return 'Fail'
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const v = mean(values.map((x) => (x - m) ** 2))
  return Math.sqrt(v)
}

function formatMs(seconds: number): string {
  return `${(seconds * 1000).toFixed(2)} ms`
}

async function gotoAndWaitForMounts(
  page: Page,
  path: string,
  expected: Set<string>,
  timeoutMs: number,
): Promise<void> {
  const seen = new Set<string>()
  const handler = (msg: { text: () => string }) => {
    const text = msg.text()
    const m = /^Mounted (.+)$/.exec(text)
    if (m?.[1] && expected.has(m[1])) {
      seen.add(m[1])
    }
  }
  page.on('console', handler)
  try {
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect
      .poll(
        () => {
          for (const name of expected) {
            if (!seen.has(name)) return false
          }
          return true
        },
        { timeout: timeoutMs },
      )
      .toBe(true)
  } finally {
    page.off('console', handler)
  }
}

async function clickTabAndWaitForMounts(
  page: Page,
  link: Locator,
  expected: Set<string>,
  timeoutMs: number,
): Promise<number> {
  const seen = new Set<string>()
  const handler = (msg: { text: () => string }) => {
    const text = msg.text()
    const m = /^Mounted (.+)$/.exec(text)
    if (m?.[1] && expected.has(m[1])) {
      seen.add(m[1])
    }
  }
  page.on('console', handler)
  try {
    const t0 = process.hrtime.bigint()
    await link.click()
    await expect
      .poll(
        () => {
          for (const name of expected) {
            if (!seen.has(name)) return false
          }
          return true
        },
        { timeout: timeoutMs },
      )
      .toBe(true)
    const t1 = process.hrtime.bigint()
    return Number(t1 - t0) / 1e9
  } finally {
    page.off('console', handler)
  }
}

test.describe.configure({ mode: 'serial' })

test('tab navigation mount latency (70 visits, 10 per tab)', async ({ page }) => {
  test.setTimeout(300_000)

  const visitsPerTab = 10
  const rand = mulberry32(20260415)

  /** Every click must change `route.fullPath` or RouterView will not remount. */
  function buildPseudoRandomSequence(): (typeof TAB_DEFINITIONS)[number][] {
    const tabs = [...TAB_DEFINITIONS]
    const out: (typeof TAB_DEFINITIONS)[number][] = []
    let lastPath: string | null = null
    for (let round = 0; round < visitsPerTab; round++) {
      const perm = [...tabs]
      shuffleInPlace(perm, rand)
      if (lastPath !== null && perm[0]!.path === lastPath) {
        for (let k = 1; k < perm.length; k++) {
          if (perm[k]!.path !== lastPath) {
            ;[perm[0], perm[k]] = [perm[k]!, perm[0]!]
            break
          }
        }
      }
      for (const tab of perm) {
        out.push(tab)
      }
      lastPath = perm[perm.length - 1]!.path
    }
    return out
  }

  const sequence = buildPseudoRandomSequence()
  if (sequence[0]!.path === '/home') {
    ;[sequence[0], sequence[1]] = [sequence[1]!, sequence[0]!]
  }

  await gotoAndWaitForMounts(page, '/home', HOME_MOUNTS, 30_000)

  const samplesByPath = new Map<string, number[]>()
  for (const t of TAB_DEFINITIONS) {
    samplesByPath.set(t.path, [])
  }
  const allSamples: number[] = []

  for (const tab of sequence) {
    const expected = expectedMountsForPath(tab.path)
    const link = page.getByRole('navigation', { name: 'Vendor hub tabs' }).getByRole('link', {
      name: tab.label,
    })

    const seconds = await clickTabAndWaitForMounts(page, link, expected, 30_000)
    allSamples.push(seconds)
    samplesByPath.get(tab.path)!.push(seconds)
  }

  const rows: {
    scope: string
    n: number
    avg: number
    min: number
    max: number
    std: number
    score: ReturnType<typeof scoreFromSeconds>
  }[] = []

  rows.push({
    scope: 'All tabs combined',
    n: allSamples.length,
    avg: mean(allSamples),
    min: Math.min(...allSamples),
    max: Math.max(...allSamples),
    std: stdDev(allSamples),
    score: scoreFromSeconds(mean(allSamples)),
  })

  for (const t of TAB_DEFINITIONS) {
    const vals = samplesByPath.get(t.path)!
    rows.push({
      scope: t.display,
      n: vals.length,
      avg: mean(vals),
      min: Math.min(...vals),
      max: Math.max(...vals),
      std: stdDev(vals),
      score: scoreFromSeconds(mean(vals)),
    })
  }

  const header =
    '| Scope | N | Average | Min | Max | Std dev | Score |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |'
  const body = rows
    .map(
      (r) =>
        `| ${r.scope} | ${r.n} | ${formatMs(r.avg)} | ${formatMs(r.min)} | ${formatMs(r.max)} | ${formatMs(r.std)} | ${r.score} |`,
    )
    .join('\n')

  const table = `${header}\n${body}`
  console.log('\n=== TAB NAVIGATION BENCHMARK ===\n')
  console.log(table)
  console.log('\nCriteria: Good < 3s, Medium < 5s, Low < 7s, Fail ≥ 7s (by average).')
  console.log(`Pseudo-random order: seeded shuffle (seed 20260415), ${visitsPerTab} visits per tab.\n`)

  expect(rows.length).toBe(TAB_DEFINITIONS.length + 1)
})
