import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Share2,
  Users,
} from 'lucide-react'
import { useEvent, useMyRegistrations, useRegister } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/api/client'
import { verifyInviteCode } from '@/api/registrations'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  clearRegistrationLock,
  isRegistrationInProgress,
  setRegistrationLock,
} from '@/lib/registrationLock'
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'
import { cn } from '@/lib/utils'
import type { Event } from '@/types'

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const linkedinUrl = z
  .string()
  .optional()
  .refine((val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(val), {
    message: 'Must be a valid LinkedIn URL',
  })

const personalInfoSchema = z
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

const teamSetupSchema = z
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

const reviewSchema = z.object({
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

function createTrackSelectionSchema(teamMode: 'create' | 'join') {
  if (teamMode === 'join') {
    return z.object({ trackId: z.string().optional() })
  }
  return z.object({ trackId: z.string().min(1, 'Please select a track') })
}

const registrationFormSchema = z
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

type RegistrationFormValues = z.infer<typeof registrationFormSchema>

const PROJECT_ROLE_LABELS: Record<RegistrationFormValues['projectRole'], string> = {
  developer: 'Developer',
  designer: 'Designer',
  data_scientist: 'Data Scientist',
  other: 'Other',
}

function generateInvitePreview(teamName: string): string {
  return teamName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, 'X')
}

const REGISTRATION_STEPS = [
  { id: 'personal', label: 'Personal Info', description: 'Your details' },
  { id: 'team', label: 'Team Setup', description: 'Create or join' },
  { id: 'track', label: 'Track', description: 'Choose a track' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
] as const

function getRegistrationSteps(teamMode: 'create' | 'join') {
  if (teamMode === 'join') {
    return REGISTRATION_STEPS.filter((step) => step.id !== 'track')
  }
  return REGISTRATION_STEPS
}

function getRegistrationStepIndex(currentStep: number, teamMode: 'create' | 'join'): number {
  if (teamMode === 'join') {
    if (currentStep <= 1) return currentStep
    return 2
  }
  return currentStep
}

// ---------------------------------------------------------------------------
// Private components
// ---------------------------------------------------------------------------

interface WizardStep {
  id: string
  label: string
  description?: string
}

interface StepWizardProps {
  steps: readonly WizardStep[]
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSubmit?: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  isSubmitting?: boolean
  nextDisabled?: boolean
  children: ReactNode
  className?: string
}

function StepWizard({
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSubmitting,
  nextDisabled,
  children,
  className,
}: StepWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const activeStep = steps[currentStep]

  return (
    <div className={cn('space-y-8', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{activeStep?.label}</span>
        </div>
        <Progress value={progress} aria-label="Registration progress" />
        <ol className="hidden gap-2 sm:flex">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs',
                index === currentStep && 'border-primary bg-primary/5 text-primary',
                index < currentStep && 'border-primary/30 text-primary',
                index > currentStep && 'text-muted-foreground',
              )}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <span className="font-medium">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="min-h-[320px]">{children}</div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={onSubmit} disabled={isSubmitting || nextDisabled}>
            {isSubmitting ? 'Submitting…' : 'Complete Registration'}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={nextDisabled}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface RegistrationResult {
  registrationId?: string
  registrationCode?: string
  inviteCode?: string
  teamName?: string
  trackName?: string
  mode: 'create' | 'join'
}

interface RegistrationConfirmationProps {
  event: Event
  result: RegistrationResult
}

function RegistrationConfirmation({ event, result }: RegistrationConfirmationProps) {
  const inviteLink = `${window.location.origin}/events/${event.id}/register?code=${result.inviteCode ?? ''}`
  const shareText = `I just registered for BeetleX Hackathon! Join my team: ${inviteLink}`

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-bounce-once rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-10 w-10 text-primary animate-pulse" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">You&apos;re registered!</h1>
        <p className="text-muted-foreground">
          Welcome to <span className="font-medium text-foreground">{event.title}</span>. Save your
          codes below and invite teammates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration details</CardTitle>
          <CardDescription>
            {result.mode === 'create'
              ? 'Share your invite code with teammates.'
              : 'You have joined your team successfully.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          {result.registrationCode && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Registration ID</p>
                <p className="font-mono font-semibold">{result.registrationCode}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(result.registrationCode!, 'Registration code')}
                aria-label="Copy registration code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {result.inviteCode && result.mode === 'create' && (
            <>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Team invite code</p>
                  <p className="font-mono font-semibold">{result.inviteCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(result.inviteCode!, 'Invite code')}
                  aria-label="Copy invite code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs text-muted-foreground">Team invite link</p>
                  <p className="truncate font-mono text-sm">{inviteLink}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(inviteLink, 'Invite link')}
                  aria-label="Copy invite link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {result.teamName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                Team: <strong>{result.teamName}</strong>
              </span>
            </div>
          )}

          {result.trackName && (
            <p className="text-sm text-muted-foreground">
              Track: <span className="text-foreground">{result.trackName}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm">
        <p className="font-medium">Share your registration</p>
        <p className="mt-1 text-muted-foreground">{shareText}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareTwitter}>
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={shareWhatsApp}>
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(shareText, 'Share text')}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Copy text
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/events/${event.id}`}>Back to Event</Link>
        </Button>
      </div>
    </div>
  )
}

interface PersonalInfoStepProps {
  form: UseFormReturn<RegistrationFormValues>
}

function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const bioLength = form.watch('bio')?.length ?? 0

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself for event registration.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name *</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Chen" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@university.edu" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role in project *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="data_scientist">Data Scientist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College / University</FormLabel>
                <FormControl>
                  <Input placeholder="MIT" {...field} />
                </FormControl>
                <FormDescription>One of college or organization is required</FormDescription>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Company or lab" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/you" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="githubUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub username (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="octocat" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief bio (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your background and interests..."
                  className="min-h-[100px] resize-none"
                  maxLength={300}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right">{bioLength}/300 characters</FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

interface TeamSetupStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
}

function TeamSetupStep({ form, event }: TeamSetupStepProps) {
  const teamMode = form.watch('teamMode')
  const teamName = form.watch('teamName') ?? ''
  const [verifying, setVerifying] = useState(false)
  const [verifiedMembers, setVerifiedMembers] = useState<
    { name: string; email: string; role: string }[]
  >([])

  const previewCode =
    teamMode === 'create' && teamName.trim().length >= 3 ? generateInvitePreview(teamName) : null

  const handleVerifyCode = async () => {
    const code = form.getValues('inviteCode')?.trim()
    if (!code) {
      form.setError('inviteCode', { message: 'Enter an invite code' })
      return
    }

    setVerifying(true)
    setVerifiedMembers([])
    form.setValue('verifiedTeamName', undefined)

    try {
      const team = await verifyInviteCode({ inviteCode: code })
      form.setValue('verifiedTeamName', team.name)
      form.clearErrors('inviteCode')
      setVerifiedMembers(team.members)
      toast.success(`Found team: ${team.name}`)
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not verify invite code'
      form.setError('inviteCode', { message })
      if (error instanceof ApiClientError && error.code === 'TEAM_FULL') {
        toast.error(`Team is full (max ${event.teamMaxSize} members)`)
      }
    } finally {
      setVerifying(false)
    }
  }

  const copyCode = async () => {
    if (!previewCode) return
    await navigator.clipboard.writeText(previewCode)
    toast.success('Invite code copied')
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Team Setup</h2>
          <p className="text-sm text-muted-foreground">
            Create a new team or join an existing one. Teams must have {event.teamMinSize}–
            {event.teamMaxSize} members.
          </p>
        </div>

        <FormField
          control={form.control}
          name="teamMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you like to participate?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue('verifiedTeamName', undefined)
                    setVerifiedMembers([])
                  }}
                  value={field.value}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <FormItem>
                    <FormControl>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="create" />
                        <div>
                          <p className="font-medium">Create a team</p>
                          <p className="text-sm text-muted-foreground">
                            Start a new team and invite others
                          </p>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="join" />
                        <div>
                          <p className="font-medium">Join a team</p>
                          <p className="text-sm text-muted-foreground">
                            Enter an invite code from your team leader
                          </p>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {teamMode === 'create' ? (
          <>
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Quantum Coders" maxLength={30} {...field} />
                  </FormControl>
                  <FormDescription>3–30 characters, letters and numbers only</FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is your team building?"
                      className="resize-none"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-right">
                    {(field.value?.length ?? 0)}/200 characters
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {previewCode && (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Generated invite code</p>
                  <p className="font-mono text-lg font-semibold">{previewCode}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void copyCode()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Invite code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC123"
                        className="uppercase"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          form.setValue('verifiedTeamName', undefined)
                          setVerifiedMembers([])
                        }}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleVerifyCode()}
                  disabled={verifying}
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                </Button>
              </div>
            </div>

            {form.watch('verifiedTeamName') && (
              <div className="rounded-lg border bg-green-500/5 p-4">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Team: {form.watch('verifiedTeamName')}
                </p>
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Current members ({verifiedMembers.length})
                  </p>
                  <ul className="space-y-2">
                    {verifiedMembers.map((m) => (
                      <li key={m.email} className="flex items-center gap-2 text-sm">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{m.name}</span>
                        <span className="text-muted-foreground">({m.role})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Form>
  )
}

interface TrackSelectionStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
}

function TrackSelectionStep({ form, event }: TrackSelectionStepProps) {
  const teamMode = form.watch('teamMode')

  if (teamMode === 'join') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Track Selection</h2>
          <p className="text-sm text-muted-foreground">
            When joining a team, your track is assigned by the team leader. You can view available
            tracks below for reference.
          </p>
        </div>
        <div className="space-y-3">
          {event.tracks.map((track) => (
            <div key={track.id} className="rounded-lg border p-4">
              <p className="font-medium">{track.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Choose Your Track</h2>
          <p className="text-sm text-muted-foreground">
            Select the challenge track your team will compete in.
          </p>
        </div>

        <FormField
          control={form.control}
          name="trackId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Track</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  className="space-y-3"
                >
                  {event.tracks.map((track) => (
                    <FormItem key={track.id}>
                      <FormControl>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value={track.id} className="mt-1" />
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{track.name}</p>
                              {track.techStack.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{track.description}</p>
                            <details className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer text-primary hover:underline">
                                View full problem statement
                              </summary>
                              <p className="mt-2">{track.problemStatement}</p>
                            </details>
                          </div>
                        </label>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

interface ReviewStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
  onEditStep: (step: number) => void
}

function ReviewStep({ form, event, onEditStep }: ReviewStepProps) {
  const values = form.getValues()
  const selectedTrack = event.tracks.find((t) => t.id === values.trackId)

  const sections = [
    {
      title: 'Personal Info',
      step: 0,
      rows: [
        { label: 'Name', value: values.name },
        { label: 'Email', value: values.email },
        { label: 'Phone', value: values.phone || '—' },
        {
          label: 'Affiliation',
          value: [values.college, values.organization].filter(Boolean).join(' · ') || '—',
        },
        { label: 'Role', value: PROJECT_ROLE_LABELS[values.projectRole] },
        { label: 'LinkedIn', value: values.linkedinUrl || '—' },
        { label: 'GitHub', value: values.githubUsername || '—' },
        { label: 'Bio', value: values.bio || '—' },
      ],
    },
    {
      title: 'Team',
      step: 1,
      rows: [
        {
          label: 'Mode',
          value: values.teamMode === 'create' ? 'Create new team' : 'Join existing team',
        },
        {
          label: 'Team',
          value:
            values.teamMode === 'create'
              ? `"${values.teamName}"`
              : `${values.verifiedTeamName} (code: ${values.inviteCode?.toUpperCase()})`,
        },
        ...(values.teamDescription
          ? [{ label: 'Description', value: values.teamDescription }]
          : []),
      ],
    },
    {
      title: 'Track',
      step: 2,
      rows: [
        {
          label: 'Track',
          value:
            values.teamMode === 'join'
              ? 'Assigned by team'
              : (selectedTrack?.name ?? 'Not selected'),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review &amp; Submit</h2>
        <p className="text-sm text-muted-foreground">
          Double-check your registration details before submitting.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => onEditStep(section.step)}
            >
              Edit
            </Button>
          </div>
          <dl className="rounded-lg border divide-y">
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 p-3 sm:flex-row sm:justify-between"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-medium sm:text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <dl className="rounded-lg border p-3">
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">Event</dt>
          <dd className="font-medium">{event.title}</dd>
        </div>
      </dl>

      <Separator />

      <Form {...form}>
        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Terms &amp; conditions *</FormLabel>
                <FormDescription>
                  I agree to the hackathon rules, code of conduct, and eligibility requirements.
                </FormDescription>
                <FormMessage role="alert" />
              </div>
            </FormItem>
          )}
        />
      </Form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Registration page
// ---------------------------------------------------------------------------

const MIN_SUBMIT_INTERVAL_MS = 5_000
const IDEMPOTENCY_KEY_PREFIX = 'registration-idempotency-'

function isRetryableRegistrationError(error: unknown) {
  if (!(error instanceof ApiClientError)) return false
  return (
    error.code === 'HTTP_429' ||
    error.code === 'HTTP_503' ||
    error.code === 'RATE_LIMITED' ||
    error.code === 'SERVICE_UNAVAILABLE'
  )
}

interface RegistrationDraft {
  values: RegistrationFormValues
  currentStep: number
}

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: event, isLoading, isError } = useEvent(id)
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations()
  const { registerMutation, joinTeamMutation } = useRegister()
  const { user, isAuthenticated } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [duplicateInfo, setDuplicateInfo] = useState<{
    registrationCode?: string
    teamName?: string
    trackName?: string
  } | null>(null)
  const [registrationInProgressElsewhere, setRegistrationInProgressElsewhere] = useState(
    () => (id ? isRegistrationInProgress(id) : false),
  )
  const [isRetryingSubmit, setIsRetryingSubmit] = useState(false)
  const [queueInfo, setQueueInfo] = useState<{
    queuePosition?: number
    estimatedWaitSeconds?: number
  } | null>(null)
  const [overloadPaused, setOverloadPaused] = useState(false)
  const failedSubmitAttemptsRef = useRef(0)
  const backgroundRetryRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleSubmitRef = useRef<(options?: { silent?: boolean }) => Promise<boolean>>(async () => false)

  const lastSubmitAtRef = useRef(0)
  const draftRestoredRef = useRef(false)

  const simulateOverload =
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('beetlex-simulate-overload') === '1'

  const idempotencyKey = useMemo(() => {
    if (!id) return undefined
    const storageKey = `${IDEMPOTENCY_KEY_PREFIX}${id}`
    const existing = sessionStorage.getItem(storageKey)
    if (existing) return existing
    const key = crypto.randomUUID()
    sessionStorage.setItem(storageKey, key)
    return key
  }, [id])

  const draftKey = id ? `registration-draft-${id}` : null

  const existingRegistration = registrations?.find((r) => r.eventId === id)

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      college: user?.college ?? '',
      organization: user?.organization ?? '',
      projectRole: 'developer',
      linkedinUrl: '',
      githubUsername: '',
      bio: '',
      teamMode: 'create',
      teamName: '',
      teamDescription: '',
      inviteCode: '',
      verifiedTeamName: undefined,
      trackId: '',
      agreeTerms: false,
    },
    mode: 'onChange',
  })

  const formValues = form.watch()
  const teamMode = form.watch('teamMode')
  const wizardSteps = useMemo(() => getRegistrationSteps(teamMode), [teamMode])
  const wizardStepIndex = getRegistrationStepIndex(currentStep, teamMode)
  const isSubmitting =
    registerMutation.isPending || joinTeamMutation.isPending || isRetryingSubmit

  useEffect(() => {
    if (!id) return

    const syncLockState = () => setRegistrationInProgressElsewhere(isRegistrationInProgress(id))
    syncLockState()
    window.addEventListener('storage', syncLockState)
    return () => window.removeEventListener('storage', syncLockState)
  }, [id])

  useEffect(() => {
    if (!draftKey || draftRestoredRef.current || existingRegistration) return
    const draft = loadSessionDraft<RegistrationDraft>(draftKey)
    if (!draft?.values) return
    form.reset(draft.values)
    setCurrentStep(draft.currentStep)
    draftRestoredRef.current = true
    toast.info('Restored your saved registration progress')
  }, [draftKey, existingRegistration, form])

  useEffect(() => {
    if (!id || draftRestoredRef.current || existingRegistration) return
    const code = searchParams.get('code') ?? searchParams.get('invite')
    if (!code?.trim()) return

    const normalized = code.trim().toUpperCase()
    form.setValue('teamMode', 'join')
    form.setValue('inviteCode', normalized)

    void verifyInviteCode({ inviteCode: normalized })
      .then((team) => {
        form.setValue('verifiedTeamName', team.name)
        form.clearErrors('inviteCode')
        toast.info(`Invite link applied — team: ${team.name}`)
      })
      .catch(() => {
        toast.warning('Invite code from link could not be verified — please verify manually')
      })
  }, [id, searchParams, existingRegistration, form])

  useEffect(() => {
    if (!draftKey || existingRegistration || result) return
    saveSessionDraft(draftKey, { values: formValues, currentStep })
  }, [draftKey, existingRegistration, result, formValues, currentStep])

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      const values = form.getValues()
      const parsed = personalInfoSchema.safeParse({
        name: values.name,
        email: values.email,
        phone: values.phone,
        college: values.college,
        organization: values.organization,
        projectRole: values.projectRole,
        linkedinUrl: values.linkedinUrl,
        githubUsername: values.githubUsername,
        bio: values.bio,
      })
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegistrationFormValues
          form.setError(field, { message: issue.message })
        })
        return false
      }
      return true
    }

    if (currentStep === 1) {
      const values = form.getValues()
      const parsed = teamSetupSchema.safeParse({
        teamMode: values.teamMode,
        teamName: values.teamName,
        teamDescription: values.teamDescription,
        inviteCode: values.inviteCode,
        verifiedTeamName: values.verifiedTeamName,
      })
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegistrationFormValues
          form.setError(field, { message: issue.message })
        })
        return false
      }
      return true
    }

    if (currentStep === 2 && teamMode === 'create') {
      const values = form.getValues()
      const parsed = createTrackSelectionSchema('create').safeParse({ trackId: values.trackId })
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          form.setError('trackId', { message: issue.message })
        })
        return false
      }
      return true
    }

    if (currentStep === 3) {
      const parsed = reviewSchema.safeParse({ agreeTerms: form.getValues('agreeTerms') })
      if (!parsed.success) {
        form.setError('agreeTerms', { message: parsed.error.issues[0]?.message })
        return false
      }
      return true
    }

    return true
  }

  const handleNext = async () => {
    const valid = await validateCurrentStep()
    if (!valid) return
    if (currentStep === 1 && teamMode === 'join') {
      setCurrentStep(3)
      return
    }
    setCurrentStep((s) => Math.min(s + 1, 3))
  }

  const handleBack = () => {
    if (currentStep === 3 && teamMode === 'join') {
      setCurrentStep(1)
      return
    }
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (options?: { silent?: boolean }) => {
    const valid = await form.trigger()
    if (!valid || !event || !id) return false

    const now = Date.now()
    if (!options?.silent && now - lastSubmitAtRef.current < MIN_SUBMIT_INTERVAL_MS) {
      toast.warning('Please wait a few seconds before submitting again')
      return false
    }
    lastSubmitAtRef.current = now

    const values = form.getValues()
    setDuplicateInfo(null)
    setRegistrationLock(id)

    try {
      setIsRetryingSubmit(true)
      setQueueInfo(null)

      if (values.teamMode === 'create') {
        const response = await retryWithBackoff(
          () =>
            registerMutation.mutateAsync({
              eventId: id,
              teamName: values.teamName!.trim(),
              trackId: values.trackId!,
              profile: {
                phone: values.phone?.trim() || undefined,
                college: values.college?.trim() || undefined,
                organization: values.organization?.trim() || undefined,
                projectRole: values.projectRole,
                linkedinUrl: values.linkedinUrl?.trim() || undefined,
                githubUsername: values.githubUsername?.trim() || undefined,
                bio: values.bio?.trim() || undefined,
              },
              idempotencyKey,
              simulateOverload,
            }),
          {
            maxAttempts: 4,
            baseDelayMs: 2000,
            shouldRetry: isRetryableRegistrationError,
          },
        )

        const track = event.tracks.find((t) => t.id === values.trackId)

        setResult({
          mode: 'create',
          registrationId: response.registrationId,
          registrationCode: response.registrationCode ?? `BX-${response.inviteCode}`,
          inviteCode: response.inviteCode,
          teamName: values.teamName!.trim(),
          trackName: track?.name,
        })
      } else {
        const team = await retryWithBackoff(
          () =>
            joinTeamMutation.mutateAsync({
              inviteCode: values.inviteCode!.trim(),
              simulateOverload,
            }),
          {
            maxAttempts: 4,
            baseDelayMs: 2000,
            shouldRetry: isRetryableRegistrationError,
          },
        )

        const track = event.tracks.find((t) => t.id === team.trackId)

        setResult({
          mode: 'join',
          registrationCode: `BX-${team.inviteCode}`,
          teamName: team.name,
          trackName: track?.name,
        })
      }

      if (draftKey) clearSessionDraft(draftKey)
      if (id) sessionStorage.removeItem(`${IDEMPOTENCY_KEY_PREFIX}${id}`)
      setOverloadPaused(false)
      failedSubmitAttemptsRef.current = 0
      if (!options?.silent) toast.success('Registration complete!')
      return true
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'ALREADY_REGISTERED') {
        const details = error.details as {
          registrationCode?: string
          teamName?: string
          trackName?: string
        }
        setDuplicateInfo(details)
        if (!options?.silent) toast.error('You are already registered for this event')
        return false
      }

      if (error instanceof ApiClientError && error.code === 'RATE_LIMITED') {
        const details = error.details as {
          queuePosition?: number
          estimatedWaitSeconds?: number
        }
        setQueueInfo(details)
        if (!options?.silent) {
          toast.warning(
            `High demand — you're in a virtual queue (position ${details.queuePosition ?? '—'}). Estimated wait: ${Math.ceil((details.estimatedWaitSeconds ?? 120) / 60)} minutes.`,
          )
        }
      } else if (isRetryableRegistrationError(error)) {
        failedSubmitAttemptsRef.current += 1
        if (failedSubmitAttemptsRef.current >= 3) {
          setOverloadPaused(true)
          if (!options?.silent) {
            toast.error(
              'Registration is temporarily unavailable due to high demand. Your form is saved. We will retry automatically.',
            )
          }
        } else if (!options?.silent) {
          toast.error(
            'High demand right now — registration is temporarily unavailable. Your form is saved locally.',
          )
        }
      } else if (!options?.silent) {
        const message =
          error instanceof ApiClientError ? error.message : 'Registration failed. Please try again.'
        toast.error(message)
      }
      return false
    } finally {
      setIsRetryingSubmit(false)
      clearRegistrationLock(id)
    }
  }

  handleSubmitRef.current = handleSubmit

  useEffect(() => {
    if (!overloadPaused || result) {
      if (backgroundRetryRef.current) {
        clearInterval(backgroundRetryRef.current)
        backgroundRetryRef.current = null
      }
      return
    }

    backgroundRetryRef.current = setInterval(() => {
      void handleSubmitRef.current({ silent: true }).then((success) => {
        if (success) toast.success('Registration completed after retry!')
      })
    }, 30_000)

    return () => {
      if (backgroundRetryRef.current) clearInterval(backgroundRetryRef.current)
    }
  }, [overloadPaused, result])

  if (isLoading || registrationsLoading) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </>
    )
  }

  if (isError || !event) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button asChild className="mt-6">
            <Link to="/events">Browse Events</Link>
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>
                You need to be signed in to register for {event.title}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the development toolbar at the bottom-left to sign in as a participant, then
                return here to complete registration.
              </p>
              <Button variant="outline" asChild>
                <Link to={`/events/${event.id}`}>Back to Event</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  if (result) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto px-4 py-12">
          <RegistrationConfirmation event={event} result={result} />
        </main>
        <Footer />
      </>
    )
  }

  if (existingRegistration || duplicateInfo) {
    const code = duplicateInfo?.registrationCode ?? existingRegistration?.registrationCode
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Already registered</AlertTitle>
            <AlertDescription>
              Looks like you&apos;re already registered for {event.title}.
              {code && (
                <>
                  {' '}
                  Your registration code is <strong className="font-mono">{code}</strong>.
                </>
              )}
              {duplicateInfo?.teamName && (
                <>
                  {' '}
                  You&apos;re on team <strong>{duplicateInfo.teamName}</strong>
                  {duplicateInfo.trackName ? `, track ${duplicateInfo.trackName}` : ''}.
                </>
              )}
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/dashboard">View your dashboard</Link>
            </Button>
            {code && (
              <Button
                variant="outline"
                onClick={() =>
                  void navigator.clipboard.writeText(code).then(() => toast.success('Code copied'))
                }
              >
                Share registration
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (registrationInProgressElsewhere) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Registration in progress</AlertTitle>
            <AlertDescription>
              Registration is in progress in another tab. Please wait for it to complete, or refresh
              this page in a moment.
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="ghost" asChild>
              <Link to={`/events/${event.id}`}>Back to Event</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const registrationClosed =
    Date.now() > new Date(event.registrationClose).getTime() || event.status === 'closed'

  if (registrationClosed) {
    return (
      <>
        <Header />
        <main id="main-content" className="container mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Registration closed</h1>
          <p className="mt-2 text-muted-foreground">
            Registration for {event.title} is no longer open.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link to={`/events/${event.id}`}>Back to Event</Link>
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
            &larr; Back
          </Button>
          <h1 className="text-2xl font-bold">Register for {event.title}</h1>
          <p className="mt-1 text-muted-foreground">
            Complete all steps to secure your spot in the hackathon.
          </p>
        </div>

        {overloadPaused && (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Registration temporarily unavailable</AlertTitle>
            <AlertDescription>
              High demand right now. Your form is saved locally and we are retrying automatically
              every 30 seconds.
            </AlertDescription>
          </Alert>
        )}

        {queueInfo && (
          <Alert className="mb-4">
            <AlertTitle>Virtual queue</AlertTitle>
            <AlertDescription>
              Position {queueInfo.queuePosition ?? '—'} — estimated wait{' '}
              {Math.ceil((queueInfo.estimatedWaitSeconds ?? 120) / 60)} minutes.
            </AlertDescription>
          </Alert>
        )}

        {isRetryingSubmit && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Submitting registration</AlertTitle>
            <AlertDescription>
              High demand — retrying automatically if the server is busy.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <StepWizard
              steps={wizardSteps}
              currentStep={wizardStepIndex}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={() => void handleSubmit()}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === 3}
              isSubmitting={isSubmitting}
            >
              {currentStep === 0 && <PersonalInfoStep form={form} />}
              {currentStep === 1 && <TeamSetupStep form={form} event={event} />}
              {currentStep === 2 && teamMode === 'create' && (
                <TrackSelectionStep form={form} event={event} />
              )}
              {currentStep === 3 && (
                <ReviewStep form={form} event={event} onEditStep={setCurrentStep} />
              )}
            </StepWizard>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
