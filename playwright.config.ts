import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './benchmarks',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
        trace: 'off',
      },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'off',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
