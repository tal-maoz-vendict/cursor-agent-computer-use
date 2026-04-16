import type { CDPSession, Page } from '@playwright/test'

/**
 * Chrome DevTools preset values (see Chromium `NetworkThrottlingManager` presets).
 * CDP `downloadThroughput` / `uploadThroughput` are bytes per second.
 */
export const FAST_4G = {
  latencyMs: 165,
  downloadBytesPerSec: (9 * 1000 * 1000) / 8 * 0.9,
  uploadBytesPerSec: (1.5 * 1000 * 1000) / 8 * 0.9,
} as const

export const SLOW_4G = {
  latencyMs: 562.5,
  downloadBytesPerSec: (1.6 * 1000 * 1000) / 8 * 0.9,
  uploadBytesPerSec: (750 * 1000) / 8 * 0.9,
} as const

export type ThrottleProfile = typeof FAST_4G | typeof SLOW_4G

let activeSession: CDPSession | null = null

export async function applyNetworkThrottle(
  page: Page,
  profile: ThrottleProfile,
): Promise<void> {
  await clearNetworkThrottle(page)
  const client = await page.context().newCDPSession(page)
  activeSession = client
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.latencyMs,
    downloadThroughput: profile.downloadBytesPerSec,
    uploadThroughput: profile.uploadBytesPerSec,
  })
}

export async function clearNetworkThrottle(page: Page): Promise<void> {
  if (activeSession) {
    try {
      await activeSession.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      })
    } catch {
      /* session may already be detached */
    }
    try {
      await activeSession.detach()
    } catch {
      /* ignore */
    }
    activeSession = null
  }
}
