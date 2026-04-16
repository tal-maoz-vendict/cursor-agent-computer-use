import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

import { buildScopeRows } from './tab-loading/aggregate'
import { getMountTimeoutMs, getVisitsPerTab, SEQUENCE_SEED } from './tab-loading/constants'
import { applyNetworkProfile, NETWORK_PROFILES } from './tab-loading/network-throttle'
import { goToTab, type TabSample } from './tab-loading/navigation'
import {
  buildTabLoadingReportHtml,
  type ProfileReport,
} from './tab-loading/report-html'
import { formatMarkdownTable } from './tab-loading/report-console'
import { buildPseudoRandomSequence } from './tab-loading/sequence'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = join(__dirname, '..', 'benchmarks-output')
const REPORT_HTML = join(REPORT_DIR, 'tabs-loading-report.html')

test('tab loading: normal + Fast 4G + Slow 4G', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP network emulation is Chromium-only')

  const visitsPerTab = getVisitsPerTab()
  const sequence = buildPseudoRandomSequence(SEQUENCE_SEED, visitsPerTab)
  const perProfileMs = sequence.length * getMountTimeoutMs('slow-4g') + 60_000
  test.setTimeout(NETWORK_PROFILES.length * perProfileMs)

  const sections: ProfileReport[] = []

  for (const profile of NETWORK_PROFILES) {
    await applyNetworkProfile(context, page, profile)
    const mountTimeoutMs = getMountTimeoutMs(profile.id)

    const samples: TabSample[] = []

    await page.goto('/home')
    await page.waitForURL('**/home')

    for (const path of sequence) {
      await goToTab(page, path, samples, mountTimeoutMs)
    }

    const rows = buildScopeRows(samples)
    sections.push({ profile, samples, rows })

    console.log(`\n=== Tab loading — ${profile.label} (ms) ===\n`)
    console.log(formatMarkdownTable(rows))
    console.log('')

    for (const s of samples) {
      expect(s.ms).toBeLessThan(mountTimeoutMs)
    }
  }

  mkdirSync(REPORT_DIR, { recursive: true })
  const html = buildTabLoadingReportHtml(
    'Tab loading benchmark',
    new Date().toISOString(),
    sections,
  )
  writeFileSync(REPORT_HTML, html, 'utf8')
  console.log(`\nHTML report written to ${REPORT_HTML}\n`)
})
