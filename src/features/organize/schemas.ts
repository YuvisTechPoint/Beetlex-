import { z } from 'zod'

const trackSchema = z.object({
  name: z.string().min(2, 'Track name must be at least 2 characters'),
  description: z.string().min(10, 'Add a short track description'),
})

export const basicsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  rules: z.string().optional(),
  eligibility: z.string().optional(),
})

export const scheduleSchema = z
  .object({
    registrationOpen: z.string().min(1, 'Registration open date is required'),
    registrationClose: z.string().min(1, 'Registration close date is required'),
    submissionDeadline: z.string().min(1, 'Submission deadline is required'),
    judgingDate: z.string().min(1, 'Judging date is required'),
    resultsDate: z.string().min(1, 'Results date is required'),
    teamMinSize: z.number().min(1).max(4),
    teamMaxSize: z.number().min(1).max(8),
  })
  .superRefine((data, ctx) => {
    const open = new Date(data.registrationOpen).getTime()
    const close = new Date(data.registrationClose).getTime()
    const submit = new Date(data.submissionDeadline).getTime()
    const judging = new Date(data.judgingDate).getTime()
    const results = new Date(data.resultsDate).getTime()

    if (close <= open) {
      ctx.addIssue({
        code: 'custom',
        message: 'Registration close must be after open',
        path: ['registrationClose'],
      })
    }
    if (submit <= close) {
      ctx.addIssue({
        code: 'custom',
        message: 'Submission deadline must be after registration closes',
        path: ['submissionDeadline'],
      })
    }
    if (judging <= submit) {
      ctx.addIssue({
        code: 'custom',
        message: 'Judging must be after submissions close',
        path: ['judgingDate'],
      })
    }
    if (results <= judging) {
      ctx.addIssue({
        code: 'custom',
        message: 'Results must be after judging',
        path: ['resultsDate'],
      })
    }
    if (data.teamMaxSize < data.teamMinSize) {
      ctx.addIssue({
        code: 'custom',
        message: 'Max team size must be at least the minimum',
        path: ['teamMaxSize'],
      })
    }
  })

export const tracksSchema = z.object({
  tracks: z.array(trackSchema).min(1, 'Add at least one track').max(6),
})

export const createHackathonSchema = basicsSchema.merge(scheduleSchema).merge(tracksSchema)

export type CreateHackathonFormValues = z.infer<typeof createHackathonSchema>

export function defaultCreateHackathonValues(): CreateHackathonFormValues {
  const open = new Date()
  open.setHours(0, 0, 0, 0)
  const close = new Date(open)
  close.setDate(close.getDate() + 30)
  const submit = new Date(open)
  submit.setDate(submit.getDate() + 45)
  const judging = new Date(open)
  judging.setDate(judging.getDate() + 50)
  const results = new Date(open)
  results.setDate(results.getDate() + 55)

  const toLocal = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60_000)
    return local.toISOString().slice(0, 16)
  }

  return {
    title: '',
    tagline: '',
    description: '',
    rules: '',
    eligibility: '',
    registrationOpen: toLocal(open),
    registrationClose: toLocal(close),
    submissionDeadline: toLocal(submit),
    judgingDate: toLocal(judging),
    resultsDate: toLocal(results),
    teamMinSize: 1,
    teamMaxSize: 4,
    tracks: [{ name: '', description: '' }],
  }
}

export function toCreateEventPayload(values: CreateHackathonFormValues) {
  const toIso = (value: string) => new Date(value).toISOString()

  return {
    title: values.title.trim(),
    tagline: values.tagline.trim(),
    description: values.description.trim(),
    rules: values.rules?.trim() ?? '',
    eligibility: values.eligibility?.trim() ?? '',
    registrationOpen: toIso(values.registrationOpen),
    registrationClose: toIso(values.registrationClose),
    submissionDeadline: toIso(values.submissionDeadline),
    judgingDate: toIso(values.judgingDate),
    resultsDate: toIso(values.resultsDate),
    teamMinSize: values.teamMinSize,
    teamMaxSize: values.teamMaxSize,
    tracks: values.tracks.map((track) => ({
      name: track.name.trim(),
      description: track.description.trim(),
    })),
  }
}
