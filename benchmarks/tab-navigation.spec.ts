import { expect, test, type Page } from '@playwright/test'

import { buildPseudoRandomSequence } from './tab-navigation/sequence'
import { goToTab, type TabSample } from './tab-navigation/measure'
import { printBothTables } from './tab-navigation/print-table'
import {
  applyNetworkThrottle,
  clearNetworkThrottle,
  FAST_4G,
  SLOW_4G,
} from './tab-navigation/throttling'

async function runSequence(page: Page, samples: TabSample[]): Promise<void> {
  await page.goto('/home')
  await page.waitForURL('**/home')
  const sequence = buildPseudoRandomSequence(0x4e17_2026)
  for (const path of sequence) {
    await goToTab(page, path, samples)
  }
}

test.describe('tab navigation mount latency', () => {
  test.afterEach(async ({ page }) => {
    await clearNetworkThrottle(page)
  })

  test('Fast 4G and Slow 4G tables', async ({ page }) => {
    test.setTimeout(900_000)
    const fastSamples: TabSample[] = []
    const slowSamples: TabSample[] = []

    await applyNetworkThrottle(page, FAST_4G)
    await runSequence(page, fastSamples)

    await applyNetworkThrottle(page, SLOW_4G)
    await runSequence(page, slowSamples)

    printBothTables(fastSamples, slowSamples)

    for (const s of [...fastSamples, ...slowSamples]) {
      expect(s.ms).toBeLessThan(120_000)
    }
  })
})
