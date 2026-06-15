import { http, HttpResponse, delay } from 'msw'
import { delayMs } from '@/mocks/utils'
import { randomGetDelay, randomMutateDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, jsonError, requireAuth } from './helpers'
import type { Submission } from '@/types'

export const submissionHandlers = [
  http.get('/api/submissions/my', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registration = db.registrations.find((r) => r.userId === auth.id)
    if (!registration) {
      return HttpResponse.json(null)
    }

    const submission = db.submissions.find((s) => s.teamId === registration.teamId) ?? null
    return HttpResponse.json(submission)
  }),

  http.post('/api/submissions', async ({ request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const registration = db.registrations.find((r) => r.userId === auth.id)
    if (!registration) {
      return jsonError('NOT_REGISTERED', 'You must register for an event first', 400)
    }

    const body = (await request.json()) as Partial<Submission>
    let submission = db.submissions.find((s) => s.teamId === registration.teamId)

    if (submission) {
      Object.assign(submission, {
        title: body.title ?? submission.title,
        description: body.description ?? submission.description,
        techStack: body.techStack ?? submission.techStack,
        demoUrl: body.demoUrl ?? submission.demoUrl,
        repoUrl: body.repoUrl ?? submission.repoUrl,
        pitchDeckUrl: body.pitchDeckUrl ?? submission.pitchDeckUrl,
        videoUrl: body.videoUrl ?? submission.videoUrl,
        isDraft: true,
      })
    } else {
      submission = {
        id: generateId('sub'),
        teamId: registration.teamId,
        eventId: registration.eventId,
        title: body.title ?? '',
        description: body.description ?? '',
        techStack: body.techStack ?? [],
        demoUrl: body.demoUrl ?? '',
        repoUrl: body.repoUrl ?? '',
        pitchDeckUrl: body.pitchDeckUrl,
        videoUrl: body.videoUrl,
        isDraft: true,
      }
      db.submissions.push(submission)
      db.organizerStats.draftSubmissions += 1
    }

    const team = db.teams.find((t) => t.id === registration.teamId)
    if (team) {
      team.submissionStatus = 'draft'
    }

    return HttpResponse.json(submission)
  }),

  http.put('/api/submissions/:id/submit', async ({ params, request }) => {
    await randomMutateDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const submission = db.submissions.find((s) => s.id === params.id)
    if (!submission) {
      return jsonError('NOT_FOUND', 'Submission not found', 404)
    }

    const event = db.events.find((e) => e.id === submission.eventId)
    if (event && new Date() > new Date(event.submissionDeadline)) {
      return jsonError('DEADLINE_PASSED', 'The submission deadline has passed', 403)
    }

    submission.isDraft = false
    submission.submittedAt = new Date().toISOString()
    submission.scores = submission.scores ?? []

    const team = db.teams.find((t) => t.id === submission.teamId)
    if (team) {
      team.submissionStatus = 'submitted'
    }

    db.organizerStats.submissionsReceived += 1
    db.organizerStats.submissionsPending += 1
    if (db.organizerStats.draftSubmissions > 0) {
      db.organizerStats.draftSubmissions -= 1
    }

    return HttpResponse.json(submission)
  }),

  http.post('/api/submissions/upload', async ({ request }) => {
    await delay(delayMs.upload)
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const formData = await request.formData()
    const file = formData.get('file')
    const field = (formData.get('field') as string) ?? 'file'

    if (!(file instanceof File)) {
      return jsonError('INVALID_FILE', 'No file provided', 400)
    }

    const url = `https://mock-cdn.beetlex.dev/uploads/${Date.now()}-${file.name}`
    return HttpResponse.json({ url, field })
  }),
]
