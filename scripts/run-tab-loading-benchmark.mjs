#!/usr/bin/env node
/**
 * Runs the tab loading Playwright benchmark (normal, Fast 4G, Slow 4G) and
 * writes a deterministic markdown report under benchmarks-output/reports/.
 * Exit code matches Playwright (0 = all tests passed).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const reportName = `tabs-loading-report-${new Date().toISOString().replaceAll(':', '-').slice(0, 19)}Z.md`
const reportPath = join(root, 'benchmarks-output', 'reports', reportName)

const env = {
  ...process.env,
  TAB_BENCHMARK_REPORT_MD: reportPath,
}

const pw = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'playwright.cmd' : 'playwright')
const cmd = existsSync(pw) ? pw : 'npx'
const args = existsSync(pw)
  ? ['test', 'benchmarks/tabs-loading-normal-and-throttle.spec.ts', '--project=chromium']
  : ['playwright', 'test', 'benchmarks/tabs-loading-normal-and-throttle.spec.ts', '--project=chromium']

const r = spawnSync(cmd, args, {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (typeof r.status === 'number' && r.status !== 0) {
  process.exit(r.status)
}
if (r.error) {
  console.error(r.error)
  process.exit(1)
}
process.exit(0)
