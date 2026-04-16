import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

import { getMountTimeoutMs, getVisitsPerTab, SEQUENCE_SEED } from './tab-loading/constants'
import { buildTabLoadingReportMarkdown, formatMarkdownTable } from './tab-loading/report-markdown'
import { buildTabLoadingReportHtml } from './tab-loading/report-html'
import { NETWORK_PROFILES } from './tab-loading/network-throttle'
import {
  benchmarkResultToProfileReports,
  runTabLoadingBenchmark,
} from './tab-loading/run-tab-loading-benchmark'
import { buildPseudoRandomSequence } from './tab-loading/sequence'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = join(__dirname, '..', 'benchmarks-output')
const REPORT_HTML = join(REPORT_DIR, 'tabs-loading-report.html')
const REPORTS_SUBDIR = join(REPORT_DIR, 'reports')

function resolveMarkdownReportPath(): string {
  const fromEnv = process.env.TAB_BENCHMARK_REPORT_MD?.trim()
  if (fromEnv) return fromEnv
  const stamp = new Date().toISOString().replaceAll(':', '-').slice(0, 19)
  return join(REPORTS_SUBDIR, `tabs-loading-report-${stamp}Z.md`)
}

test('tab loading: normal + Fast 4G + Slow 4G', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP network emulation is Chromium-only')

  const visitsPerTab = getVisitsPerTab()
  const sequence = buildPseudoRandomSequence(SEQUENCE_SEED, visitsPerTab)
  const perProfileMs =
    sequence.length * Math.max(...NETWORK_PROFILES.map((p) => getMountTimeoutMs(p.id))) + 60_000
  test.setTimeout(NETWORK_PROFILES.length * perProfileMs)

  const benchmark = await runTabLoadingBenchmark(page, context)

  for (const p of benchmark.profiles) {
    console.log(`\n=== Tab loading — ${p.profile.label} (ms) ===\n`)
    console.log(formatMarkdownTable(p.rows))
    console.log('')
  }

  mkdirSync(REPORTS_SUBDIR, { recursive: true })
  mkdirSync(REPORT_DIR, { recursive: true })

  const mdPath = resolveMarkdownReportPath()
  mkdirSync(dirname(mdPath), { recursive: true })

  const md = buildTabLoadingReportMarkdown(benchmark)
  writeFileSync(mdPath, md, 'utf8')
  console.log(`\nMarkdown report written to ${mdPath}\n`)

  const profileBits = benchmark.profiles.map((p) => `${p.profile.id}:${p.passed ? 'pass' : 'fail'}`)
  console.log(
    `TAB_BENCHMARK_SUMMARY\t${benchmark.ok ? 'PASSED' : 'FAILED'}\t${profileBits.join('\t')}\treport=${mdPath}`,
  )

  const sections = benchmarkResultToProfileReports(benchmark)
  const html = buildTabLoadingReportHtml(
    benchmark.ok ? 'Tab loading benchmark — passed' : 'Tab loading benchmark — failed',
    benchmark.finishedAtIso,
    sections,
  )
  writeFileSync(REPORT_HTML, html, 'utf8')
  console.log(`HTML report written to ${REPORT_HTML}\n`)

  expect(benchmark.ok, mdPath).toBe(true)
})
