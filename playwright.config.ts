import { defineConfig } from '@playwright/test'

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright/html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright/results.json' }],
  ],
  outputDir: 'reports/playwright/artifacts',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'screenshots',
      testMatch: /screenshots\.spec\.ts/,
    },
  ],
  webServer: process.env.QA_SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'npm run preview:qa',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
