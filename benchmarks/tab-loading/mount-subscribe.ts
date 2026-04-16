import type { Page } from '@playwright/test'

/** Subscribe before navigation so synchronous onMounted logs are not missed. */
export function subscribeMountedComplete(
  page: Page,
  expected: string[],
  startTime: number,
  timeoutMs: number,
): Promise<number> {
  const pending = new Set(expected)
  return new Promise<number>((resolve, reject) => {
    const handler = (msg: { text: () => string }) => {
      const text = msg.text()
      const m = /^Mounted (.+)$/.exec(text)
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
