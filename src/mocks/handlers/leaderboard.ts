import { http, HttpResponse } from 'msw'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, getUserFromRequest, jsonError } from './helpers'

function leaderboardForEvent(eventId: string) {
  if (eventId !== 'evt-active-1') {
    return { published: false, entries: [] as typeof db.leaderboard }
  }
  return { published: db.leaderboardPublished, entries: db.leaderboard }
}

export const leaderboardHandlers = [
  http.get('/api/leaderboard/:eventId', async ({ params, request }) => {
    await randomGetDelay()
    const eventId = params.eventId as string
    const user = getUserFromRequest(request)
    const isOrganizer = user?.role === 'organizer'
    const payload = leaderboardForEvent(eventId)

    if (!payload.published && !isOrganizer) {
      return HttpResponse.json({ published: false, entries: [] })
    }

    return HttpResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    })
  }),

  http.get('/api/leaderboard/:eventId/status', async ({ params, request }) => {
    await randomGetDelay()
    const user = getUserFromRequest(request)
    const isOrganizer = user?.role === 'organizer'
    const eventId = params.eventId as string
    const { published } = leaderboardForEvent(eventId)

    if (!published && !isOrganizer) {
      return HttpResponse.json({ published: false })
    }

    return HttpResponse.json({ published })
  }),

  http.put('/api/leaderboard/:eventId/publish', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = getUserFromRequest(request)
    if (!auth) {
      return jsonError('UNAUTHORIZED', 'Authentication required', 401)
    }
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
