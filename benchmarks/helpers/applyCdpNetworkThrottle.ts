import type { Page } from '@playwright/test'

import type { NetworkProfile } from './devtoolsNetworkProfiles'

/** Apply DevTools-style throttling; pass `null` to restore default (no emulation). */
export async function applyCdpNetworkThrottle(
  page: Page,
  profile: NetworkProfile | null,
): Promise<void> {
  const session = await page.context().newCDPSession(page)
  await session.send('Network.enable')
  if (profile === null) {
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    })
  } else {
    await session.send('Network.emulateNetworkConditions', {
      offline: profile.offline,
      latency: profile.latency,
      downloadThroughput: profile.downloadThroughput,
      uploadThroughput: profile.uploadThroughput,
    })
  }
}
