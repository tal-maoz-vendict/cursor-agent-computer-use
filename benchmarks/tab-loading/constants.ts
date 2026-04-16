/** Tab routes exercised by the mount benchmark (must match app router). */
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

/** Deterministic shuffle seed (change only when you intentionally reset baselines). */
export const SEQUENCE_SEED = 0x4e17_2026

export const DEFAULT_VISITS_PER_TAB = 10

export const DEFAULT_MOUNT_TIMEOUT_MS = 30_000

/** Cap visits so accidental env values do not create multi-hour runs. */
export function getVisitsPerTab(): number {
  const raw = process.env.TAB_BENCHMARK_VISITS
  if (raw === undefined || raw === '') return DEFAULT_VISITS_PER_TAB
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_VISITS_PER_TAB
  return Math.min(Math.floor(n), 50)
}

export type TabBenchmarkNetworkKind = 'normal' | 'fast-4g' | 'slow-4g'

export function getMountTimeoutMs(profileId: TabBenchmarkNetworkKind): number {
  const raw = process.env.TAB_BENCHMARK_MOUNT_TIMEOUT_MS
  if (raw !== undefined && raw !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 5000) return Math.min(n, 600_000)
  }
  return profileId === 'slow-4g' ? 90_000 : DEFAULT_MOUNT_TIMEOUT_MS
}
