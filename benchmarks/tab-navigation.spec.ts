import { expect, test } from '@playwright/test'

import { applyCdpNetworkThrottle } from './helpers/applyCdpNetworkThrottle'
import { DEVTOOLS_FAST_4G, DEVTOOLS_SLOW_4G } from './helpers/devtoolsNetworkProfiles'
import {
  buildPseudoRandomSequence,
  goToTab,
  printResultsTable,
  type TabSample,
} from './helpers/tabNavigationBenchmark'

test('tab navigation mount latency (Fast 4G and Slow 4G)', async ({ page }) => {
  test.setTimeout(600_000)

  const sequence = buildPseudoRandomSequence(0x4e17_2026)

  await applyCdpNetworkThrottle(page, DEVTOOLS_FAST_4G)
  await page.goto('/home')
  await page.waitForURL('**/home')
  const fastSamples: TabSample[] = []
  for (const path of sequence) {
    await goToTab(page, path, fastSamples)
  }
  printResultsTable(
    'Fast 4G — Tab navigation (goto start → last `onMounted <name>` in vh-main)',
    fastSamples,
  )

  await applyCdpNetworkThrottle(page, DEVTOOLS_SLOW_4G)
  await page.goto('/home')
  await page.waitForURL('**/home')
  const slowSamples: TabSample[] = []
  for (const path of sequence) {
    await goToTab(page, path, slowSamples)
  }
  printResultsTable(
    'Slow 4G — Tab navigation (goto start → last `onMounted <name>` in vh-main)',
    slowSamples,
  )

  await applyCdpNetworkThrottle(page, null)

  expect(fastSamples).toHaveLength(70)
  expect(slowSamples).toHaveLength(70)
  for (const s of [...fastSamples, ...slowSamples]) {
    expect(s.ms).toBeLessThan(60_000)
  }
})
