import type { ScopeRow } from './aggregate'

export function formatMarkdownTable(rows: ScopeRow[]): string {
  const header =
    '| Scope | Avg (ms) | Min | Max | Std dev | Score (avg) | Score (max) |\n|---|---:|---:|---:|---:|---|---|'
  const lines = rows.map(
    (r) =>
      `| ${r.scope} | ${r.avg.toFixed(1)} | ${r.min.toFixed(1)} | ${r.max.toFixed(1)} | ${r.stdDev.toFixed(1)} | ${r.scoreAvg} | ${r.scoreMax} |`,
  )
  return [header, ...lines].join('\n')
}
