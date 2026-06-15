import { http, HttpResponse, delay } from 'msw'
import { eventHandlers } from './events'
import { registrationHandlers } from './registrations'
import { submissionHandlers } from './submissions'
import { judgeHandlers } from './judges'
import { organizerHandlers } from './organizer'
import { notificationHandlers } from './notifications'
import { notificationStreamHandlers } from './notificationStream'
import { leaderboardHandlers } from './leaderboard'
import { authHandlers } from './auth'
import { leaderboardStreamHandlers } from './leaderboardStream'

export const handlers = [
  http.get('/api/health', async () => {
    await delay(300)
    return HttpResponse.json({ status: 'ok' })
  }),
  ...authHandlers,
  ...eventHandlers,
  ...registrationHandlers,
  ...submissionHandlers,
  ...judgeHandlers,
  ...organizerHandlers,
  ...notificationHandlers,
  ...notificationStreamHandlers,
  ...leaderboardHandlers,
  ...leaderboardStreamHandlers,
]
