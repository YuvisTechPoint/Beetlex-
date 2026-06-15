import { http, HttpResponse } from 'msw'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { jsonError, requireAuth } from './helpers'
import type { Score } from '@/types'

export const judgeHandlers = [
  http.get('/api/judge/queue', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    if (auth.role !== 'judge') {
      return jsonError('FORBIDDEN', 'Judge access required', 403)
    }

    const queue = db.submissions
      .filter((s) => !s.isDraft)
      .map((s) => {
        const team = db.teams.find((t) => t.id === s.teamId)
        const event = db.events.find((e) => e.id === s.eventId)
        const track = event?.tracks.find((t) => t.id === team?.trackId)
        const scored = (s.scores ?? []).some((sc) => sc.judgeId === auth.id)
        return {
          submissionId: s.id,
          teamId: s.teamId,
          teamName: team?.name ?? 'Unknown',
          title: s.title,
          trackId: team?.trackId ?? '',
          trackName: track?.name ?? 'Unknown',
          submittedAt: s.submittedAt ?? '',
          scored,
        }
      })

    return HttpResponse.json(queue)
  }),

  http.get('/api/judge/submissions/:id', async ({ params, request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    if (auth.role !== 'judge') {
      return jsonError('FORBIDDEN', 'Judge access required', 403)
    }

    const submission = db.submissions.find((s) => s.id === params.id)
    if (!submission || submission.isDraft) {
      return jsonError('NOT_FOUND', 'Submission not found', 404)
    }

    return HttpResponse.json(submission)
  }),

  http.post('/api/judge/submissions/:id/score', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    if (auth.role !== 'judge') {
      return jsonError('FORBIDDEN', 'Judge access required', 403)
    }

    const submission = db.submissions.find((s) => s.id === params.id)
    if (!submission || submission.isDraft) {
      return jsonError('NOT_FOUND', 'Submission not found', 404)
    }

    const body = (await request.json()) as Omit<Score, 'judgeId' | 'submittedAt'>
    const score: Score = {
      judgeId: auth.id,
      innovation: body.innovation,
      technicalExecution: body.technicalExecution,
      impact: body.impact,
      presentation: body.presentation,
      comments: body.comments,
      submittedAt: new Date().toISOString(),
    }

    if (!submission.scores) submission.scores = []
    const existingIdx = submission.scores.findIndex((s) => s.judgeId === auth.id)
    const wasPending = existingIdx < 0
    if (existingIdx >= 0) {
      submission.scores[existingIdx] = score
    } else {
      submission.scores.push(score)
    }

    if (wasPending) {
      db.organizerStats.submissionsPending = Math.max(0, db.organizerStats.submissionsPending - 1)
      const totalScored = db.submissions.filter(
        (s) => !s.isDraft && (s.scores?.length ?? 0) > 0,
      ).length
      const totalSubmitted = db.submissions.filter((s) => !s.isDraft).length
      db.organizerStats.judgingProgress =
        totalSubmitted > 0 ? Math.round((totalScored / totalSubmitted) * 100) : 0
    }

    return HttpResponse.json(score)
  }),
]
