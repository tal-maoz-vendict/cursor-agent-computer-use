import type { ScopeRow } from './aggregate'
import { TAB_LABEL } from './constants'
import type { TabSample } from './navigation'

import type { BenchmarkProfileResult, TabLoadingBenchmarkResult } from './run-tab-loading-benchmark'

function worstSample(samples: TabSample[]): TabSample | undefined {
  if (samples.length === 0) return undefined
  return samples.reduce((a, b) => (b.ms > a.ms ? b : a))
}

function allTabsRow(rows: ScopeRow[]): ScopeRow | undefined {
  return rows.find((r) => r.scope === 'All tabs combined')
}

function escapeMdCell(s: string): string {
  return s.replaceAll('|', '\\|')
}

export function formatMarkdownTable(rows: ScopeRow[]): string {
  const header =
    '| Scope | Avg (ms) | Min | Max | Std dev | Score (avg) | Score (max) |\n| --- | ---: | ---: | ---: | ---: | --- | --- |'
  const lines = rows.map(
    (r) =>
      `| ${escapeMdCell(r.scope)} | ${r.avg.toFixed(1)} | ${r.min.toFixed(1)} | ${r.max.toFixed(1)} | ${r.stdDev.toFixed(1)} | ${r.scoreAvg} | ${r.scoreMax} |`,
  )
  return [header, ...lines].join('\n')
}

function dashboardRow(p: BenchmarkProfileResult): string {
  const combined = allTabsRow(p.rows)
  const worst = worstSample(p.samples)
  const status = p.passed ? '**Pass**' : '**Fail**'
  const worstLabel = worst ? escapeMdCell(TAB_LABEL[worst.tab]) : '—'
  const worstMs = worst ? worst.ms.toFixed(0) : '—'
  const avg = combined ? combined.avg.toFixed(1) : '—'
  return `| ${escapeMdCell(p.profile.label)} | ${status} | ${avg} | ${worstLabel} | ${worstMs} | ${p.mountTimeoutMs} |`
}

export function buildTabLoadingReportMarkdown(result: TabLoadingBenchmarkResult): string {
  const title = result.ok ? 'PASSED' : 'FAILED'
  const titleColor = result.ok ? '#1b6b3a' : '#b4232c'
  const accent = '#4c2fd1'
  const muted = '#5a4f8e'

  const dashboardHeader =
    '| Network profile | Result | Avg mount (all tabs, ms) | Slowest tab | Slowest (ms) | Mount timeout (ms) |\n| --- | --- | ---: | --- | ---: | ---: |'
  const dashboardBody = result.profiles.map(dashboardRow).join('\n')

  const failures = result.profiles.filter((p) => !p.passed)
  const alertBlock =
    failures.length === 0
      ? ''
      : [
          '> **Attention:** One or more profiles exceeded the mount timeout.',
          '',
          ...failures.flatMap((p) =>
            p.failureReasons.map(
              (line) => `> - **${escapeMdCell(p.profile.label)}:** ${escapeMdCell(line)}`,
            ),
          ),
          '',
        ].join('\n')

  const detailBlocks = result.profiles.map((p) => {
    const status = p.passed ? 'Pass' : 'Fail'
    return [
      `### ${escapeMdCell(p.profile.label)} (${status})`,
      '',
      formatMarkdownTable(p.rows),
      '',
    ].join('\n')
  })

  return [
    `<h1 align="center" style="color:${titleColor};font-size:2.25rem;margin:0.5rem 0 0.25rem;font-family:Inter,system-ui,sans-serif">${title}</h1>`,
    `<p align="center" style="color:${muted};margin:0 0 1.25rem;font-size:0.95rem;font-family:Inter,system-ui,sans-serif">Tab loading benchmark · Chromium CDP network emulation</p>`,
    '',
    alertBlock,
    `## Summary`,
    '',
    dashboardHeader,
    dashboardBody,
    '',
    `### Run metadata`,
    '',
    `- **Started:** ${result.startedAtIso}`,
    `- **Finished:** ${result.finishedAtIso}`,
    `- **Sequence seed:** \`0x${result.sequenceSeed.toString(16)}\` (deterministic tab order)`,
    `- **Visits per tab:** ${result.visitsPerTab}`,
    '',
    `<p style="border-left:4px solid ${accent};padding-left:12px;color:${muted};font-size:0.9rem;margin:1rem 0">Scores (Good / Medium / Low / Fail) follow the benchmark thresholds on average and max mount times.</p>`,
    '',
    `## Results by profile`,
    '',
    ...detailBlocks,
  ].join('\n')
}
