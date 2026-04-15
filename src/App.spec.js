import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'

import App from './App.vue'
import { routes } from './router/index.js'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes,
  })
}

describe('App shell', () => {
  it('renders main.vh-main with RouterView for each hub route', async () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    await router.isReady()

    const paths = [
      '/home',
      '/risk-per-domain',
      '/contacts',
      '/reports',
      '/external-risks',
      '/workflows',
      '/library',
    ]

    for (const path of paths) {
      await router.push(path)
      await router.isReady()

      const main = wrapper.find('main.vh-main')
      expect(main.exists(), `vh-main missing for ${path}`).toBe(true)
      expect(main.element.innerHTML.length, `empty main for ${path}`).toBeGreaterThan(0)
    }
  })
})
