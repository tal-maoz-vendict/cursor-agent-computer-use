import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router/index.js'

const expectedPaths = [
  '/home',
  '/risk-per-domain',
  '/contacts',
  '/reports',
  '/external-risks',
  '/workflows',
  '/library',
]

describe('router', () => {
  it('exposes every sidebar route (no 404 for tab URLs)', () => {
    const configuredPaths = routes
      .map((r) => r.path)
      .filter((p) => p !== '/' && !p.includes(':'))

    for (const path of expectedPaths) {
      expect(configuredPaths, `missing route for ${path}`).toContain(path)
    }
  })
})

describe('App layout', () => {
  it('renders main.vh-main so RouterView content is inside the main column', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    await router.push('/home')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    const main = wrapper.find('main.vh-main')
    expect(main.exists()).toBe(true)
    expect(main.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
