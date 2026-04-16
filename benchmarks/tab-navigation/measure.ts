import type { Page } from '@playwright/test'

import type { TabPath } from './constants'
import { EXPECTED_MOUNTED_BY_TAB } from './constants'

export interface TabSample {
  tab: TabPath
  ms: number
}

/** Subscribe before navigation so synchronous onMounted logs are not missed. */
function subscribeMountedComplete(
  page: Page,
  expected: string[],
  startTime: number,
  timeoutMs: number,
): Promise<number> {
  const pending = new Set(expected)
  return new Promise<number>((resolve, reject) => {
    const handler = (msg: { text: () => string }) => {
      const text = msg.text()
      const m = /^onMounted (.+)$/.exec(text)
      if (!m) return
      const name = m[1]
      if (pending.has(name)) {
        pending.delete(name)
        if (pending.size === 0) {
          page.off('console', handler)
          clearTimeout(timer)
          resolve(performance.now() - startTime)
        }
      }
    }
    page.on('console', handler)
    const timer = setTimeout(() => {
      page.off('console', handler)
      reject(
        new Error(
          `Timeout after ${timeoutMs}ms. Still waiting for: ${[...pending].join(', ')}`,
        ),
      )
    }, timeoutMs)
  })
}

export async function goToTab(page: Page, path: TabPath, samples: TabSample[]): Promise<void> {
  const url = page.url()
  const onTarget = url.endsWith(path) || url.includes(`${path}?`) || url.includes(`${path}#`)
  if (onTarget) {
    const pivot = path === '/home' ? '/library' : '/home'
    await page.goto(pivot)
    await page.waitForURL(`**${pivot}`)
  }
  const expected = EXPECTED_MOUNTED_BY_TAB[path]
  const start = performance.now()
  const mountedPromise = subscribeMountedComplete(page, expected, start, 120_000)
  await page.goto(path)
  await page.waitForURL(`**${path}`)
  const elapsedMs = await mountedPromise
  samples.push({ tab: path, ms: elapsedMs })
}
