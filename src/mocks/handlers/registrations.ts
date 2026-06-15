import { http, HttpResponse } from 'msw'
import { mockEvents } from '@/mocks/data'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import type { Registration, Team } from '@/types'
import { db } from './db'
import { generateId, jsonError, requireAuth } from './helpers'

function buildInviteCode(teamName: string) {
  return teamName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, 'X')
}

export const registrationHandlers = [
  http.get('/api/registrations/me', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registrations = db.registrations.filter((r) => r.userId === auth.id)
    return HttpResponse.json(registrations)
  }),

  http.get('/api/registrations/check-email', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const url = new URL(request.url)
    const eventId = url.searchParams.get('eventId') ?? ''
    const email = (url.searchParams.get('email') ?? '').trim().toLowerCase()

    if (!eventId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return HttpResponse.json({
        available: false,
        reason: 'invalid_email',
        message: 'Enter a valid email address',
      })
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email)
    const existingForUser = db.registrations.find(
      (r) => r.userId === auth.id && r.eventId === eventId,
    )
    if (existingForUser) {
      return HttpResponse.json({
        available: false,
        reason: 'already_registered',
        message: 'You are already registered for this event',
      })
    }

    const takenByOther = db.registrations.some((r) => {
      if (r.eventId !== eventId) return false
      const member = db.teams
        .find((t) => t.id === r.teamId)
        ?.members.find((m) => m.email.toLowerCase() === email)
      return Boolean(member && r.userId !== auth.id)
    })

    if (takenByOther) {
      return HttpResponse.json({
        available: false,
        reason: 'taken_by_other',
        message: 'This email is already registered on another team for this event',
      })
    }

    if (user && user.id !== auth.id) {
      return HttpResponse.json({
        available: false,
        reason: 'taken_by_other',
        message: 'This email is associated with another account',
      })
    }

    return HttpResponse.json({ available: true })
  }),

  http.get('/api/teams/me', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registration = db.registrations.find((r) => r.userId === auth.id)
    if (!registration) {
      return HttpResponse.json(null)
    }

    const team = db.teams.find((t) => t.id === registration.teamId)
    if (!team) {
      return HttpResponse.json(null)
    }

    const hydratedTeam = {
      ...team,
      members: team.members.map((member) => {
        const profile = db.users.find((user) => user.id === member.userId)
        return profile ? { ...member, name: profile.name, email: profile.email } : member
      }),
    }

    return HttpResponse.json(hydratedTeam)
  }),

  http.post('/api/teams', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const body = (await request.json()) as {
      eventId: string
      teamName: string
      trackId: string
    }

    const event = db.events.find((e) => e.id === body.eventId)
    if (!event) {
      return jsonError('NOT_FOUND', 'Event not found', 404)
    }

    if (event.status === 'closed') {
      return jsonError('REGISTRATION_CLOSED', 'Registration is closed for this event', 403)
    }

    const track = event.tracks.find((t) => t.id === body.trackId)
    if (!track) {
      return jsonError('INVALID_TRACK', 'Select a valid track', 400)
    }

    const teamName = body.teamName?.trim() ?? ''
    if (teamName.length < 3 || teamName.length > 30) {
      return jsonError('INVALID_TEAM_NAME', 'Team name must be 3–30 characters', 400)
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(teamName)) {
      return jsonError('INVALID_TEAM_NAME', 'Team name can only contain letters and numbers', 400)
    }

    const existingRegistration = db.registrations.find((r) => r.userId === auth.id)
    if (existingRegistration) {
      const existingTeam = db.teams.find((t) => t.id === existingRegistration.teamId)
      const existingEvent = db.events.find((e) => e.id === existingRegistration.eventId)
      const existingTrack = existingEvent?.tracks.find((t) => t.id === existingTeam?.trackId)
      return jsonError('ALREADY_REGISTERED', 'You are already registered for an event', 409, {
        registrationId: existingRegistration.id,
        registrationCode: existingRegistration.registrationCode,
        teamId: existingRegistration.teamId,
        teamName: existingTeam?.name,
        trackName: existingTrack?.name,
      })
    }

    const teamId = generateId('team')
    const inviteCode = buildInviteCode(teamName)

    const team: Team = {
      id: teamId,
      name: teamName,
      inviteCode,
      eventId: body.eventId,
      trackId: body.trackId,
      submissionStatus: 'not_started',
      members: [
        {
          userId: auth.id,
          name: auth.name,
          email: auth.email,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        },
      ],
    }

    const registration: Registration = {
      id: generateId('reg'),
      userId: auth.id,
      eventId: body.eventId,
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

    return HttpResponse.json(
      {
        team,
        registrationCode: registration.registrationCode,
        inviteCode,
      },
      { status: 201 },
    )
  }),

  http.post('/api/teams/verify', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const body = (await request.json()) as { inviteCode: string }
    const team = db.teams.find((t) => t.inviteCode.toLowerCase() === body.inviteCode.toLowerCase())

    if (!team) {
      return jsonError('INVALID_INVITE_CODE', 'Invalid invite code', 404)
    }

    const event = db.events.find((e) => e.id === team.eventId) ?? mockEvents[0]
    if (team.members.length >= event.teamMaxSize) {
      return jsonError('TEAM_FULL', 'This team has reached maximum capacity', 409, {
        maxSize: event.teamMaxSize,
      })
    }

    return HttpResponse.json(team)
  }),

  http.post('/api/teams/join', async ({ request }) => {
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

    const body = (await request.json()) as { inviteCode: string }
    const team = db.teams.find((t) => t.inviteCode.toLowerCase() === body.inviteCode.toLowerCase())

    if (!team) {
      return jsonError('INVALID_INVITE_CODE', 'Invalid invite code', 404)
    }

    const event = db.events.find((e) => e.id === team.eventId) ?? mockEvents[0]
    if (team.members.length >= event.teamMaxSize) {
      return jsonError('TEAM_FULL', 'This team has reached maximum capacity', 409)
    }

    const existingReg = db.registrations.find(
      (r) => r.userId === auth.id && r.eventId === team.eventId,
    )

    if (existingReg) {
      const event = db.events.find((e) => e.id === team.eventId) ?? mockEvents[0]
      const track = event.tracks.find((t) => t.id === team.trackId)
      return jsonError('ALREADY_REGISTERED', 'You are already registered for this event', 409, {
        registrationId: existingReg.id,
        registrationCode: existingReg.registrationCode,
        teamId: existingReg.teamId,
        teamName: team.name,
        trackName: track?.name,
      })
    }

    const alreadyMember = team.members.some((m) => m.userId === auth.id)
    if (!alreadyMember) {
      team.members.push({
        userId: auth.id,
        name: auth.name,
        email: auth.email,
        role: 'member',
        joinedAt: new Date().toISOString(),
      })
    }

    db.registrations.push({
      id: generateId('reg'),
      userId: auth.id,
      eventId: team.eventId,
      teamId: team.id,
      registrationCode: `BX-${team.inviteCode}`,
      createdAt: new Date().toISOString(),
    })
    db.organizerStats.totalParticipants += 1
    delete db.registerAttemptCounts[auth.id]

    return HttpResponse.json(team)
  }),

  http.delete('/api/teams/me/members/:userId', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registration = db.registrations.find((r) => r.userId === auth.id)
    if (!registration) return jsonError('NOT_FOUND', 'Team not found', 404)

    const team = db.teams.find((t) => t.id === registration.teamId)
    if (!team) return jsonError('NOT_FOUND', 'Team not found', 404)

    const leader = team.members.find((m) => m.userId === auth.id && m.role === 'leader')
    if (!leader) return jsonError('FORBIDDEN', 'Only team leader can remove members', 403)

    const targetId = params.userId as string
    if (targetId === auth.id) return jsonError('BAD_REQUEST', 'Cannot remove yourself', 400)

    team.members = team.members.filter((m) => m.userId !== targetId)
    return HttpResponse.json(team)
  }),

  http.post('/api/teams/me/leave', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registration = db.registrations.find((r) => r.userId === auth.id)
    if (!registration) return jsonError('NOT_FOUND', 'Not on a team', 404)

    const team = db.teams.find((t) => t.id === registration.teamId)
    if (!team) return jsonError('NOT_FOUND', 'Team not found', 404)

    team.members = team.members.filter((m) => m.userId !== auth.id)
    db.registrations = db.registrations.filter((r) => r.id !== registration.id)

    return HttpResponse.json({ success: true })
  }),
]
