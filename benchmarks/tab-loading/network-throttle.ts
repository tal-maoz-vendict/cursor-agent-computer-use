import type { BrowserContext, CDPSession, Page } from '@playwright/test'

/**
 * Chrome DevTools–aligned presets (bytes/sec, ms latency).
 * @see https://stackoverflow.com/questions/48367042/in-chrome-dev-tools-what-is-the-speed-of-each-preset-option-for-network-throttl
 */
export type NetworkProfileId = 'normal' | 'fast-4g' | 'slow-4g'

export interface NetworkProfile {
  id: NetworkProfileId
  label: string
  /** CDP Network.emulateNetworkConditions payload */
  cdp: {
    offline: boolean
    downloadThroughput: number
    uploadThroughput: number
    latency: number
    connectionType?: 'none' | 'cellular4g' | 'ethernet' | 'wifi' | 'other'
  }
}

export const NETWORK_PROFILES: readonly NetworkProfile[] = [
  {
    id: 'normal',
    label: 'Normal (no throttle)',
    cdp: {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
      connectionType: 'ethernet',
    },
  },
  {
    id: 'fast-4g',
    label: 'Fast 4G',
    cdp: {
      offline: false,
      downloadThroughput: (9 * 1000 * 1000) / 8 * 0.9,
      uploadThroughput: (1.5 * 1000 * 1000) / 8 * 0.9,
      latency: 60 * 2.75,
      connectionType: 'cellular4g',
    },
  },
  {
    id: 'slow-4g',
    label: 'Slow 4G',
    cdp: {
      offline: false,
      downloadThroughput: (1.6 * 1000 * 1000) / 8 * 0.9,
      uploadThroughput: (750 * 1000) / 8 * 0.9,
      latency: 150 * 2.75,
      connectionType: 'cellular4g',
    },
  },
]

let cdpSession: CDPSession | undefined

export async function applyNetworkProfile(
  context: BrowserContext,
  page: Page,
  profile: NetworkProfile,
): Promise<void> {
  if (!cdpSession) {
    cdpSession = await context.newCDPSession(page)
    await cdpSession.send('Network.enable')
  }
  await cdpSession.send('Network.emulateNetworkConditions', profile.cdp)
}
