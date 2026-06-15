import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEvent, useMyRegistrations, useRegister } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/api/client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StepWizard } from '@/pages/registration/StepWizard'
import { PersonalInfoStep } from '@/pages/registration/steps/PersonalInfoStep'
import { TeamSetupStep } from '@/pages/registration/steps/TeamSetupStep'
import { TrackSelectionStep } from '@/pages/registration/steps/TrackSelectionStep'
import { ReviewStep } from '@/pages/registration/steps/ReviewStep'
import {
  RegistrationConfirmation,
  type RegistrationResult,
} from '@/pages/registration/RegistrationConfirmation'
import {
  createTrackSelectionSchema,
  getRegistrationStepIndex,
  getRegistrationSteps,
  personalInfoSchema,
  registrationFormSchema,
  reviewSchema,
  teamSetupSchema,
  type RegistrationFormValues,
} from '@/pages/registration/schemas'
import { verifyInviteCode } from '@/api/registrations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  clearRegistrationLock,
  isRegistrationInProgress,
  setRegistrationLock,
} from '@/lib/registrationLock'
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'

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
