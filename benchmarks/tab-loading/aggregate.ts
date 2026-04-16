import type { TabPath } from './constants'
import { TAB_LABEL, TAB_PATHS } from './constants'
import type { TabSample } from './navigation'
import { mean, scoreForMs, stdDev } from './stats'

export interface ScopeRow {
  scope: string
  avg: number
  min: number
  max: number
  stdDev: number
  scoreAvg: ReturnType<typeof scoreForMs>
  scoreMax: ReturnType<typeof scoreForMs>
}

export function buildScopeRows(samples: TabSample[]): ScopeRow[] {
  const byTab = new Map<TabPath, number[]>()
  for (const p of TAB_PATHS) byTab.set(p, [])
  for (const s of samples) {
    byTab.get(s.tab)?.push(s.ms)
  }

  const allMs = samples.map((s) => s.ms)
  const rows: ScopeRow[] = [
    {
      scope: 'All tabs combined',
      ...statsFromMs(allMs),
    },
    ...TAB_PATHS.map((p) => ({
      scope: TAB_LABEL[p],
      ...statsFromMs(byTab.get(p) ?? []),
    })),
  ]
  return rows
}

function statsFromMs(ms: number[]): Omit<ScopeRow, 'scope'> {
  if (ms.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      scoreAvg: 'Fail',
      scoreMax: 'Fail',
    }
  }
  const avg = mean(ms)
  const mn = Math.min(...ms)
  const mx = Math.max(...ms)
  const sd = stdDev(ms)
  return {
    avg,
    min: mn,
    max: mx,
    stdDev: sd,
    scoreAvg: scoreForMs(avg),
    scoreMax: scoreForMs(mx),
  }
}
