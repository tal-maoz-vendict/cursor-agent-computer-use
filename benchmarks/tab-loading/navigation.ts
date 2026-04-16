import type { Page } from '@playwright/test'

import type { TabPath } from './constants'
import { EXPECTED_MOUNTED_BY_TAB } from './constants'
import { subscribeMountedComplete } from './mount-subscribe'

export interface TabSample {
  tab: TabPath
  ms: number
}

export async function goToTab(
  page: Page,
  path: TabPath,
  samples: TabSample[],
  mountTimeoutMs: number,
): Promise<void> {
  const url = page.url()
  const onTarget = url.endsWith(path) || url.includes(`${path}?`) || url.includes(`${path}#`)
  if (onTarget) {
    const pivot = path === '/home' ? '/library' : '/home'
    await page.goto(pivot)
    await page.waitForURL(`**${pivot}`)
  }
  const expected = EXPECTED_MOUNTED_BY_TAB[path]
  const start = performance.now()
  const mountedPromise = subscribeMountedComplete(page, expected, start, mountTimeoutMs)
  await page.goto(path)
  await page.waitForURL(`**${path}`)
  const elapsedMs = await mountedPromise
  samples.push({ tab: path, ms: elapsedMs })
}
