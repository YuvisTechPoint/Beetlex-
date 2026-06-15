import type { Page } from '@playwright/test'

const PARTICIPANT_AUTH = {
  state: {
    user: {
      id: 'user-participant-1',
      name: 'Alex Chen',
      email: 'alex.chen@university.edu',
      role: 'participant',
      college: 'MIT',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    token: 'mock-token-participant-user-participant-1',
    isAuthenticated: true,
  },
  version: 0,
}

export async function seedParticipantAuth(page: Page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('beetlex-auth', JSON.stringify(auth))
  }, PARTICIPANT_AUTH)
}

export async function dismissOverlays(page: Page) {
  const cookieBanner = page.getByRole('button', { name: /accept|dismiss|close/i })
  if (await cookieBanner.count()) {
    await cookieBanner.first().click({ timeout: 1000 }).catch(() => undefined)
  }
}

export async function waitForAppReady(page: Page) {
  await page.waitForSelector('#main-content', { state: 'visible', timeout: 30_000 })
  // Avoid networkidle — SSE notification/leaderboard streams keep connections open when auth is seeded.
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(400)
}
