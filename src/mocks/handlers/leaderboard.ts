import { http, HttpResponse } from 'msw'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, jsonError, requireAuth } from './helpers'

export const leaderboardHandlers = [
  http.get('/api/leaderboard/:eventId', async ({ params, request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const eventId = params.eventId as string
    if (eventId !== 'evt-active-1') {
      return HttpResponse.json({ published: false, entries: [] })
    }

    const isOrganizer = auth.role === 'organizer'
    if (!db.leaderboardPublished && !isOrganizer) {
      return HttpResponse.json({ published: false, entries: [] })
    }

    return HttpResponse.json({ published: db.leaderboardPublished, entries: db.leaderboard })
  }),

  http.get('/api/leaderboard/:eventId/status', async ({ params, request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const eventId = params.eventId as string
    if (eventId !== 'evt-active-1') {
      return HttpResponse.json({ published: false })
    }

    return HttpResponse.json({ published: db.leaderboardPublished })
  }),

  http.put('/api/leaderboard/:eventId/publish', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const eventId = params.eventId as string
    if (eventId !== 'evt-active-1') {
      return jsonError('NOT_FOUND', 'Event not found', 404)
    }

    const body = (await request.json()) as { published: boolean }
    db.leaderboardPublished = body.published

    db.organizerActivity.unshift({
      id: generateId('act'),
      message: body.published
        ? 'Leaderboard results published to all participants'
        : 'Leaderboard results hidden from participants',
      createdAt: new Date().toISOString(),
      type: 'announcement',
    })

    return HttpResponse.json({ published: db.leaderboardPublished })
  }),
]
