import { describe, expect, it } from 'vitest'

import { routes } from './index.js'

const expectedPaths = [
  '/home',
  '/risk-per-domain',
  '/contacts',
  '/reports',
  '/external-risks',
  '/workflows',
  '/library',
]

describe('sidebar routes', () => {
  it('registers every hub path', () => {
    const paths = routes.map((r) => r.path)
    for (const p of expectedPaths) {
      expect(paths).toContain(p)
    }
  })

  it('redirects root to /home', () => {
    const root = routes.find((r) => r.path === '/')
    expect(root?.redirect).toBe('/home')
  })
})
