import { http, HttpResponse } from 'msw'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, jsonError, requireAuth } from './helpers'
import type { Registration, Team } from '@/types'

export const eventHandlers = [
  http.get('/api/events', async ({ request }) => {
    await randomGetDelay()
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const track = url.searchParams.get('track')
    const search = url.searchParams.get('search')?.toLowerCase()
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 10))

    let filtered = [...db.events]

    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }
    if (track) {
      filtered = filtered.filter((e) => e.tracks.some((t) => t.id === track))
    }
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.tagline.toLowerCase().includes(search) ||
          e.description.toLowerCase().includes(search),
      )
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      filtered = filtered.filter((e) => new Date(e.registrationOpen).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime()
      filtered = filtered.filter((e) => new Date(e.registrationOpen).getTime() <= to)
    }

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data,
      pagination: { page, limit, total, totalPages },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  }),

  http.get('/api/events/:id', async ({ params }) => {
    await randomGetDelay()
    const event = db.events.find((e) => e.id === params.id)
    if (!event) {
      return jsonError('NOT_FOUND', 'Event not found', 404)
    }
    return HttpResponse.json(event, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  }),

  http.get('/api/events/:id/announcements', async ({ params, request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const eventId = params.id as string
    const announcements = db.announcements
      .filter((a) => a.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json(announcements)
  }),

  http.post('/api/events/:id/register', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const simulateOverload =
      request.headers.get('X-Simulate-Overload') === '1' || db.simulateRegistrationOverload

    if (simulateOverload) {
      const attempt = (db.registerAttemptCounts[auth.id] ?? 0) + 1
      db.registerAttemptCounts[auth.id] = attempt
      if (attempt <= 2) {
        return jsonError('SERVICE_UNAVAILABLE', 'Server is busy due to high demand', 503)
      }
      if (attempt === 3) {
        return jsonError('RATE_LIMITED', 'High demand — you are in a virtual queue', 429, {
          queuePosition: 142 + Math.floor(Math.random() * 50),
          estimatedWaitSeconds: 90 + Math.floor(Math.random() * 60),
        })
      }
    }

    const eventId = params.id as string
    const event = db.events.find((e) => e.id === eventId)
    if (!event) {
      return jsonError('NOT_FOUND', 'Event not found', 404)
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (idempotencyKey) {
      const cacheKey = `${auth.id}:${idempotencyKey}`
      const cached = db.registrationIdempotency[cacheKey]
      if (cached) {
        return HttpResponse.json(cached)
      }
    }

    const existing = db.registrations.find(
      (r) => r.userId === auth.id && r.eventId === eventId,
    )
    if (existing) {
      const team = db.teams.find((t) => t.id === existing.teamId)
      const track = team ? event.tracks.find((t) => t.id === team.trackId) : undefined
      return jsonError('ALREADY_REGISTERED', 'You are already registered for this event', 409, {
        registrationId: existing.id,
        registrationCode: existing.registrationCode,
        teamId: existing.teamId,
        teamName: team?.name,
        trackName: track?.name,
      })
    }

    const body = (await request.json()) as {
      teamName: string
      trackId: string
      profile?: {
        phone?: string
        college?: string
        organization?: string
        projectRole?: string
        linkedinUrl?: string
        githubUsername?: string
        bio?: string
      }
    }
    const teamId = generateId('team')
    const inviteCode = body.teamName
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase()
      .padEnd(6, 'X')

    const memberName = auth.name
    const memberEmail = auth.email

    const team: Team = {
      id: teamId,
      name: body.teamName,
      inviteCode,
      eventId,
      trackId: body.trackId,
      submissionStatus: 'not_started',
      members: [
        {
          userId: auth.id,
          name: memberName,
          email: memberEmail,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        },
      ],
    }

    const registration: Registration = {
      id: generateId('reg'),
      userId: auth.id,
      eventId,
      teamId,
      registrationCode: `BX-${inviteCode}`,
      createdAt: new Date().toISOString(),
    }

    db.teams.push(team)
    db.registrations.push(registration)
    event.participantCount += 1
    db.organizerStats.totalParticipants += 1
    db.organizerStats.totalTeams += 1
    db.organizerStats.registrationsToday += 1
    delete db.registerAttemptCounts[auth.id]

    const response = {
      registrationId: registration.id,
      registrationCode: registration.registrationCode,
      teamId,
      inviteCode,
      team,
      profile: body.profile ?? null,
    }

    if (idempotencyKey) {
      db.registrationIdempotency[`${auth.id}:${idempotencyKey}`] = response
    }

    return HttpResponse.json(response, { status: 201 })
  }),
]
