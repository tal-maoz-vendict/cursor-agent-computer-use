/**
 * Throughput (bytes/s) and latency (ms) aligned with Chrome DevTools presets
 * for `Network.emulateNetworkConditions` (see Chromium `network_conditions.json`).
 */
export const DEVTOOLS_FAST_4G = {
  offline: false,
  latency: 165,
  downloadThroughput: (9 * 1_000_000) / 8 * 0.9,
  uploadThroughput: (1.5 * 1_000_000) / 8 * 0.9,
} as const

export const DEVTOOLS_SLOW_4G = {
  offline: false,
  latency: 562.5,
  downloadThroughput: (1.6 * 1_000_000) / 8 * 0.9,
  uploadThroughput: (750 * 1_000) / 8 * 0.9,
} as const

export type NetworkProfile = typeof DEVTOOLS_FAST_4G | typeof DEVTOOLS_SLOW_4G
