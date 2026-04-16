import type { Page } from '@playwright/test'

import { mean, scoreForMs, stdDev } from './tabBenchmarkStats'

export const TAB_PATHS = [
  '/home',
  '/risk-per-domain',
  '/contacts',
  '/reports',
  '/external-risks',
  '/workflows',
  '/library',
] as const

export type TabPath = (typeof TAB_PATHS)[number]

export const EXPECTED_MOUNTED_BY_TAB: Record<TabPath, string[]> = {
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

export const TAB_LABEL: Record<TabPath, string> = {
  '/home': 'Home',
  '/risk-per-domain': 'Risk Per Domain',
  '/contacts': 'Contacts',
  '/reports': 'Reports',
  '/external-risks': 'External Risks',
  '/workflows': 'Workflows',
  '/library': 'Library',
}

export const VISITS_PER_TAB = 10

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

export function buildPseudoRandomSequence(seed: number): TabPath[] {
  const seq: TabPath[] = []
  const rand = mulberry32(seed)
  for (const path of TAB_PATHS) {
    for (let k = 0; k < VISITS_PER_TAB; k++) seq.push(path)
  }
  shuffleInPlace(seq, rand)
  return seq
}

/** Subscribe before navigation so synchronous mount logs are not missed. */
export function subscribeMountedComplete(
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

export interface TabSample {
  tab: TabPath
  ms: number
}

export async function goToTab(page: Page, path: TabPath, samples: TabSample[]): Promise<void> {
  const url = page.url()
  const onTarget = url.endsWith(path) || url.includes(`${path}?`) || url.includes(`${path}#`)
  if (onTarget) {
    const pivot = path === '/home' ? '/library' : '/home'
    await page.goto(pivot)
    await page.waitForURL(`**${pivot}`)
  }
  const expected = EXPECTED_MOUNTED_BY_TAB[path]
  const start = performance.now()
  const mountedPromise = subscribeMountedComplete(page, expected, start, 60_000)
  await page.goto(path)
  await page.waitForURL(`**${path}`)
  const elapsedMs = await mountedPromise
  samples.push({ tab: path, ms: elapsedMs })
}

export function printResultsTable(title: string, samples: TabSample[]): void {
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

  console.log(`\n=== ${title} ===\n`)
  console.log(
    '| Scope | Avg (ms) | Min | Max | Std dev | Score |\n|---|---:|---:|---:|---:|---:|---|',
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
