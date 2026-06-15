import { z } from 'zod'

const linkedinUrl = z
  .string()
  .optional()
  .refine((val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(val), {
    message: 'Must be a valid LinkedIn URL',
  })

export const personalInfoSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), { message: 'Phone must be numeric' }),
    college: z.string().optional(),
    organization: z.string().optional(),
    projectRole: z.enum(['developer', 'designer', 'data_scientist', 'other'], {
      message: 'Select your role in the project',
    }),
    linkedinUrl,
    githubUsername: z.string().optional(),
    bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
  })
  .superRefine((data, ctx) => {
    const hasCollege = Boolean(data.college?.trim())
    const hasOrg = Boolean(data.organization?.trim())
    if (!hasCollege && !hasOrg) {
      ctx.addIssue({
        code: 'custom',
        message: 'College/University or Organization is required',
        path: ['college'],
      })
    }
  })

const teamNameRegex = /^[a-zA-Z0-9 ]+$/

export const teamSetupSchema = z
  .object({
    teamMode: z.enum(['create', 'join']),
    teamName: z.string().optional(),
    teamDescription: z.string().max(200, 'Description must be at most 200 characters').optional(),
    inviteCode: z.string().optional(),
    verifiedTeamName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.teamMode === 'create') {
      const name = data.teamName?.trim() ?? ''
      if (name.length < 3) {
        ctx.addIssue({
          code: 'custom',
          message: 'Team name must be at least 3 characters',
          path: ['teamName'],
        })
      } else if (name.length > 30) {
        ctx.addIssue({
          code: 'custom',
          message: 'Team name must be at most 30 characters',
          path: ['teamName'],
        })
      } else if (!teamNameRegex.test(name)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Team name cannot contain special characters',
          path: ['teamName'],
        })
      }
    }

    if (data.teamMode === 'join') {
      if (!data.inviteCode || data.inviteCode.trim().length < 4) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid invite code',
          path: ['inviteCode'],
        })
      } else if (!data.verifiedTeamName) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please verify your invite code before continuing',
          path: ['inviteCode'],
        })
      }
    }
  })

export const reviewSchema = z.object({
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

export function createTrackSelectionSchema(teamMode: 'create' | 'join') {
  if (teamMode === 'join') {
    return z.object({ trackId: z.string().optional() })
  }
  return z.object({ trackId: z.string().min(1, 'Please select a track') })
}

export const trackSelectionSchema = z.object({
  trackId: z.string().min(1, 'Please select a track'),
})

export const registrationFormSchema = z
  .object({
    name: personalInfoSchema.shape.name,
    email: personalInfoSchema.shape.email,
    phone: personalInfoSchema.shape.phone,
    college: personalInfoSchema.shape.college,
    organization: personalInfoSchema.shape.organization,
    projectRole: personalInfoSchema.shape.projectRole,
    linkedinUrl: personalInfoSchema.shape.linkedinUrl,
    githubUsername: personalInfoSchema.shape.githubUsername,
    bio: personalInfoSchema.shape.bio,
    teamMode: teamSetupSchema.shape.teamMode,
    teamName: teamSetupSchema.shape.teamName,
    teamDescription: teamSetupSchema.shape.teamDescription,
    inviteCode: teamSetupSchema.shape.inviteCode,
    verifiedTeamName: teamSetupSchema.shape.verifiedTeamName,
    trackId: z.string().optional(),
    agreeTerms: reviewSchema.shape.agreeTerms,
  })
  .superRefine((data, ctx) => {
    const personalResult = personalInfoSchema.safeParse({
      name: data.name,
      email: data.email,
      phone: data.phone,
      college: data.college,
      organization: data.organization,
      projectRole: data.projectRole,
      linkedinUrl: data.linkedinUrl,
      githubUsername: data.githubUsername,
      bio: data.bio,
    })
    if (!personalResult.success) {
      personalResult.error.issues.forEach((issue) => {
        ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path })
      })
    }

    const teamResult = teamSetupSchema.safeParse({
      teamMode: data.teamMode,
      teamName: data.teamName,
      teamDescription: data.teamDescription,
      inviteCode: data.inviteCode,
      verifiedTeamName: data.verifiedTeamName,
    })
    if (!teamResult.success) {
      teamResult.error.issues.forEach((issue) => {
        ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path })
      })
    }

    if (data.teamMode === 'create' && !data.trackId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a track',
        path: ['trackId'],
      })
    }
  })

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>
export type TeamSetupFormValues = z.infer<typeof teamSetupSchema>
export type TrackSelectionFormValues = z.infer<typeof trackSelectionSchema>
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>

export const PROJECT_ROLE_LABELS: Record<RegistrationFormValues['projectRole'], string> = {
  developer: 'Developer',
  designer: 'Designer',
  data_scientist: 'Data Scientist',
  other: 'Other',
}

export function generateInvitePreview(teamName: string): string {
  return teamName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, 'X')
}

export const REGISTRATION_STEPS = [
  { id: 'personal', label: 'Personal Info', description: 'Your details' },
  { id: 'team', label: 'Team Setup', description: 'Create or join' },
  { id: 'track', label: 'Track', description: 'Choose a track' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
] as const

export function getRegistrationSteps(teamMode: 'create' | 'join') {
  if (teamMode === 'join') {
    return REGISTRATION_STEPS.filter((step) => step.id !== 'track')
  }
  return REGISTRATION_STEPS
}

export function getRegistrationStepIndex(
  currentStep: number,
  teamMode: 'create' | 'join',
): number {
  if (teamMode === 'join') {
    if (currentStep <= 1) return currentStep
    return 2
  }
  return currentStep
}
