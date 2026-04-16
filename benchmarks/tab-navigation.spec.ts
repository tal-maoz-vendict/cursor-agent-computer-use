import { expect, test } from '@playwright/test'

import {
  applyChromeNetworkPreset,
  attachThrottledNetworkSession,
  CHROME_FAST_4G,
  CHROME_SLOW_4G,
} from './networkThrottle'
import {
  buildPseudoRandomSequence,
  goToTab,
  printResultsTable,
  type TabSample,
} from './tabNavigationHelpers'

test('tab navigation mount latency (Fast 4G vs Slow 4G)', async ({ page }) => {
  /** Throttled first load can be slow; tab clicks after that stay in-app. */
  test.setTimeout(900_000)

  const cdp = await attachThrottledNetworkSession(page)

  for (const preset of [CHROME_FAST_4G, CHROME_SLOW_4G]) {
    await applyChromeNetworkPreset(cdp, preset)

    const samples: TabSample[] = []
    await page.goto('about:blank')
    await page.goto('/home', { waitUntil: 'domcontentloaded', timeout: 600_000 })
    await page.waitForURL('**/home')

    const sequence = buildPseudoRandomSequence(0x4e17_2026)
    for (const path of sequence) {
      await goToTab(page, path, samples)
    }

    printResultsTable(preset.label, samples)

    for (const s of samples) {
      expect(s.ms).toBeLessThan(120_000)
    }
  }
})
