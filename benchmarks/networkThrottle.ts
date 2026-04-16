import type { CDPSession, Page } from '@playwright/test'

/** Chrome DevTools "Fast 4G" preset (see Chromium `Fast4GConditions`). */
export const CHROME_FAST_4G = {
  label: 'Fast 4G',
  latency: 60 * 2.75,
  downloadThroughput: (9 * 1_000_000) / 8 * 0.9,
  uploadThroughput: (1.5 * 1_000_000) / 8 * 0.9,
} as const

/** Chrome DevTools "Slow 4G" preset (see Chromium `Slow4GConditions`). */
export const CHROME_SLOW_4G = {
  label: 'Slow 4G',
  latency: 150 * 3.75,
  downloadThroughput: (1.6 * 1_000_000) / 8 * 0.9,
  uploadThroughput: (750 * 1_000) / 8 * 0.9,
} as const

export type ChromeNetworkPreset = typeof CHROME_FAST_4G | typeof CHROME_SLOW_4G

export async function attachThrottledNetworkSession(page: Page): Promise<CDPSession> {
  const session = await page.context().newCDPSession(page)
  await session.send('Network.enable')
  await session.send('Network.setCacheDisabled', { cacheDisabled: true })
  return session
}

export async function applyChromeNetworkPreset(
  session: CDPSession,
  preset: ChromeNetworkPreset,
): Promise<void> {
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: preset.latency,
    downloadThroughput: preset.downloadThroughput,
    uploadThroughput: preset.uploadThroughput,
    connectionType: 'cellular4g',
  })
}
