import { http, HttpResponse } from 'msw'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, jsonError, requireAuth } from './helpers'
import type { Announcement } from '@/types'
import {
  mockOrganizerActivity,
  mockOrganizerJudges,
  mockOrganizerParticipants,
  mockOrganizerSubmissions,
} from '@/mocks/data/organizer'
import { mockUserById } from '@/mocks/data/users'

const TRACK_NAMES: Record<string, string> = {
  'evt-active-1-track-devtools': 'IDE & Editor Extensions',
  'evt-active-1-track-ai': 'AI Code Assistants',
  'evt-active-1-track-ml': 'Observability & Performance',
  'evt-active-1-track-web3': 'Web3 Dev Infrastructure',
}

function buildParticipants() {
  return db.teams.flatMap((team) =>
    team.members.map((member) => {
      const status =
        team.submissionStatus === 'submitted'
          ? 'submitted'
          : team.submissionStatus === 'draft'
            ? 'draft'
            : 'registered'
      return {
        userId: member.userId,
        name: member.name,
        email: member.email,
        college:
          mockUserById[member.userId]?.college ?? mockUserById[member.userId]?.organization,
        teamId: team.id,
        teamName: team.name,
        trackId: team.trackId,
        trackName: TRACK_NAMES[team.trackId] ?? team.trackId,
        registrationCode: `BX-${team.inviteCode}`,
        registeredAt: member.joinedAt,
        status: status as 'registered' | 'submitted' | 'draft',
      }
    }),
  )
}

function buildSubmissions() {
  return db.submissions.map((sub) => {
    const team = db.teams.find((t) => t.id === sub.teamId)
    const scores = sub.scores ?? []
    const avg =
      scores.length > 0
        ? scores.reduce(
            (sum, s) => sum + s.innovation + s.technicalExecution + s.impact + s.presentation,
            0,
          ) /
          scores.length /
          4
        : undefined
    const trackId = team?.trackId ?? ''
    const assignedJudgeIds = db.submissionJudgeAssignments
      .filter((a) => a.submissionId === sub.id)
      .map((a) => a.judgeId)

    const scoreBreakdown =
      scores.length > 0
        ? {
            innovation:
              scores.reduce((sum, s) => sum + s.innovation, 0) / scores.length,
            technicalExecution:
              scores.reduce((sum, s) => sum + s.technicalExecution, 0) / scores.length,
            impact: scores.reduce((sum, s) => sum + s.impact, 0) / scores.length,
            presentation:
              scores.reduce((sum, s) => sum + s.presentation, 0) / scores.length,
          }
        : undefined

    return {
      id: sub.id,
      teamId: sub.teamId,
      teamName: team?.name ?? 'Unknown',
      title: sub.title,
      description: sub.description,
      trackId,
      trackName: TRACK_NAMES[trackId] ?? trackId,
      techStack: sub.techStack,
      demoUrl: sub.demoUrl,
      repoUrl: sub.repoUrl,
      pitchDeckUrl: sub.pitchDeckUrl,
      videoUrl: sub.videoUrl,
      isDraft: sub.isDraft,
      submittedAt: sub.submittedAt,
      scoreCount: scores.length,
      averageScore: avg,
      assignedJudgeIds,
      status: sub.isDraft ? 'draft' : scores.length > 0 ? 'scored' : 'submitted',
      scoreBreakdown,
    }
  })
}

function buildJudges() {
  const judges = Object.values(mockUserById).filter((user) => user.role === 'judge')

  return judges.map((judge) => {
    const assignment = db.judgeAssignments.find((a) => a.judgeId === judge.id)
    const trackId = assignment?.trackId
    const assignedSubs = db.submissions.filter((sub) => {
      if (sub.isDraft) return false
      const team = db.teams.find((t) => t.id === sub.teamId)
      const matchesTrack = !trackId || team?.trackId === trackId
      const explicitlyAssigned = db.submissionJudgeAssignments.some(
        (a) => a.submissionId === sub.id && a.judgeId === judge.id,
      )
      return matchesTrack || explicitlyAssigned
    })
    const reviewed = assignedSubs.filter((sub) =>
      (sub.scores ?? []).some((score) => score.judgeId === judge.id),
    ).length

    return {
      id: judge.id,
      name: judge.name,
      email: judge.email,
      organization: judge.organization,
      assignedTrackId: trackId,
      assignedTrackName: trackId ? TRACK_NAMES[trackId] : undefined,
      assignedProjectCount: assignedSubs.length,
      reviewedCount: reviewed,
      pendingCount: Math.max(0, assignedSubs.length - reviewed),
    }
  })
}

export const organizerHandlers = [
  http.get('/api/organizer/stats', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }
    return HttpResponse.json(db.organizerStats)
  }),

  http.get('/api/organizer/participants', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const participants = buildParticipants()
    return HttpResponse.json(
      participants.length > 0 ? participants : mockOrganizerParticipants,
    )
  }),

  http.get('/api/organizer/submissions', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const summaries = buildSubmissions()
    return HttpResponse.json(summaries.length > 0 ? summaries : mockOrganizerSubmissions)
  }),

  http.get('/api/organizer/activity', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    return HttpResponse.json(
      db.organizerActivity.length > 0 ? db.organizerActivity : mockOrganizerActivity,
    )
  }),

  http.get('/api/organizer/judges', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const judges = buildJudges()
    return HttpResponse.json(judges.length > 0 ? judges : mockOrganizerJudges)
  }),

  http.post('/api/organizer/judges/assign', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const body = (await request.json()) as { judgeId: string; trackId: string }
    const existingIdx = db.judgeAssignments.findIndex((a) => a.judgeId === body.judgeId)
    if (existingIdx >= 0) {
      db.judgeAssignments[existingIdx] = body
    } else {
      db.judgeAssignments.push(body)
    }

    const judge = mockUserById[body.judgeId]
    db.organizerActivity.unshift({
      id: generateId('act'),
      message: `Judge ${judge?.name ?? 'Unknown'} assigned to ${TRACK_NAMES[body.trackId] ?? body.trackId}`,
      createdAt: new Date().toISOString(),
      type: 'score',
    })

    return HttpResponse.json(buildJudges())
  }),

  http.post('/api/organizer/submissions/:id/assign-judge', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const body = (await request.json()) as { judgeId: string }
    const submissionId = params.id as string
    const submission = db.submissions.find((s) => s.id === submissionId)
    if (!submission) {
      return jsonError('NOT_FOUND', 'Submission not found', 404)
    }

    const exists = db.submissionJudgeAssignments.some(
      (a) => a.submissionId === submissionId && a.judgeId === body.judgeId,
    )
    if (!exists) {
      db.submissionJudgeAssignments.push({ submissionId, judgeId: body.judgeId })
    }

    const judge = mockUserById[body.judgeId]
    db.organizerActivity.unshift({
      id: generateId('act'),
      message: `Judge ${judge?.name ?? 'Unknown'} assigned to review "${submission.title}"`,
      createdAt: new Date().toISOString(),
      type: 'score',
    })

    return HttpResponse.json(buildSubmissions().find((s) => s.id === submissionId))
  }),

  http.post('/api/organizer/announcements', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const body = (await request.json()) as Omit<Announcement, 'id' | 'createdAt' | 'readBy'>
    const announcement: Announcement = {
      id: generateId('announce'),
      eventId: body.eventId,
      title: body.title,
      message: body.message,
      priority: body.priority,
      createdAt: new Date().toISOString(),
      readBy: [],
    }

    db.announcements.unshift(announcement)

    db.notifications.unshift({
      id: generateId('notif'),
      title: body.title,
      message: body.message,
      type: 'announcement',
      priority: body.priority,
      createdAt: announcement.createdAt,
      read: false,
    })

    db.organizerActivity.unshift({
      id: generateId('act'),
      message: `Broadcast: ${body.title}`,
      createdAt: announcement.createdAt,
      type: 'announcement',
    })

    return HttpResponse.json(announcement, { status: 201 })
  }),

  http.get('/api/organizer/leaderboard', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    return HttpResponse.json(db.leaderboard)
  }),

  http.get('/api/organizer/leaderboard/status', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }
    return HttpResponse.json({ published: db.leaderboardPublished })
  }),

  http.put('/api/organizer/leaderboard/publish', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
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

  http.put('/api/organizer/leaderboard', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth
    if (auth.role !== 'organizer') {
      return jsonError('FORBIDDEN', 'Organizer access required', 403)
    }

    const body = (await request.json()) as { entries: typeof db.leaderboard }
    db.leaderboard = body.entries
    return HttpResponse.json(db.leaderboard)
  }),
]
