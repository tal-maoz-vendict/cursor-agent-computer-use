import type { TabPath } from './constants'
import { TAB_LABEL, TAB_PATHS } from './constants'
import { mean, scoreForMs, stdDev } from './stats'
import type { TabSample } from './measure'

function printMarkdownTable(title: string, samples: TabSample[]): void {
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

  console.log(`\n### ${title}\n`)
  console.log(
    '| Scope | Avg (ms) | Min (ms) | Max (ms) | Std dev (ms) | Score (avg) |',
  )
  console.log('|---|---:|---:|---:|---:|---|')
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

export function printBothTables(fastSamples: TabSample[], slowSamples: TabSample[]): void {
  console.log('\n## Tab navigation: enter tab → all `vh-main` mounts (`onMounted <name>`)\n')
  printMarkdownTable('Fast 4G throttling', fastSamples)
  printMarkdownTable('Slow 4G throttling', slowSamples)
}
