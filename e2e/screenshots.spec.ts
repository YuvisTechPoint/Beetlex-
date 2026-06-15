import fs from 'node:fs'
import path from 'node:path'
import { test } from '@playwright/test'
import { seedParticipantAuth, waitForAppReady } from './helpers/auth'
import { AUDIT_ROUTES } from './helpers/routes'
import { VIEWPORT_MATRIX, viewportFilename } from './helpers/viewports'

const SCREENSHOT_DIR = path.join(process.cwd(), 'reports', 'screenshots')

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

for (const profile of VIEWPORT_MATRIX) {
  test.describe(`Responsive audit @ ${profile.label} (${profile.width}px)`, () => {
    test.use({
      viewport: { width: profile.width, height: profile.height },
    })

    for (const route of AUDIT_ROUTES) {
      test(`capture ${route.slug}`, async ({ page }) => {
        if (route.auth === 'participant') {
          await seedParticipantAuth(page)
        }

        await page.goto(route.path)
        await waitForAppReady(page)

        if (route.waitFor) {
          await page.waitForSelector(route.waitFor, { timeout: 15_000 })
        }

        const filename = viewportFilename(route.slug, profile)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, filename),
          fullPage: true,
        })
      })
    }
  })
}

test('write screenshot manifest', async () => {
  const manifest = {
    generatedAt: new Date().toISOString(),
    viewports: VIEWPORT_MATRIX,
    routes: AUDIT_ROUTES.map((route) => route.slug),
    files: fs
      .readdirSync(SCREENSHOT_DIR)
      .filter((file) => file.endsWith('.png'))
      .sort(),
  }

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  )
})
