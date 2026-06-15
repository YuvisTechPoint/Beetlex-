import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useEvent, useMyRegistrations, useRegister } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/api/client'
import { verifyInviteCode } from '@/api/registrations'
import {
  clearRegistrationLock,
  isRegistrationInProgress,
  setRegistrationLock,
} from '@/lib/registrationLock'
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'
import type { Event } from '@/types'
import {
  createTrackSelectionSchema,
  personalInfoSchema,
  registrationFormSchema,
  reviewSchema,
  teamSetupSchema,
  type RegistrationFormValues,
} from './schemas'
import type { RegistrationDraft, RegistrationResult } from '@/types'
import { buildSoloTeamName, usesTrackSelectionStep } from './teamMode'
import {
  getRegistrationStepIndex,
  getRegistrationSteps,
  IDEMPOTENCY_KEY_PREFIX,
  isRetryableRegistrationError,
  MIN_SUBMIT_INTERVAL_MS,
} from './utils'

export interface DuplicateRegistrationInfo {
  registrationCode?: string
  teamName?: string
  trackName?: string
}

export interface QueueInfo {
  queuePosition?: number
  estimatedWaitSeconds?: number
}

export function useRegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { data: event, isLoading, isError } = useEvent(id)
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations()
  const { registerMutation, joinTeamMutation } = useRegister()
  const { user, isAuthenticated } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateRegistrationInfo | null>(null)
  const [registrationInProgressElsewhere, setRegistrationInProgressElsewhere] = useState(() =>
    id ? isRegistrationInProgress(id) : false,
  )
  const [isRetryingSubmit, setIsRetryingSubmit] = useState(false)
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null)
  const [overloadPaused, setOverloadPaused] = useState(false)
  const failedSubmitAttemptsRef = useRef(0)
  const backgroundRetryRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleSubmitRef = useRef<(options?: { silent?: boolean }) => Promise<boolean>>(
    async () => false,
  )

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
  const isSubmitting = registerMutation.isPending || joinTeamMutation.isPending || isRetryingSubmit

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
      if (values.teamMode === 'solo' && event && event.teamMinSize > 1) {
        form.setError('teamMode', {
          message: 'Individual registration is not available for this event',
        })
        return false
      }
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

    if (currentStep === 2 && usesTrackSelectionStep(teamMode)) {
      const values = form.getValues()
      const parsed = createTrackSelectionSchema(teamMode).safeParse({ trackId: values.trackId })
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

      if (values.teamMode === 'create' || values.teamMode === 'solo') {
        const teamName =
          values.teamMode === 'solo' ? buildSoloTeamName(values.name) : values.teamName!.trim()

        const response = await retryWithBackoff(
          () =>
            registerMutation.mutateAsync({
              eventId: id,
              teamName,
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
          mode: values.teamMode === 'solo' ? 'solo' : 'create',
          registrationId: response.registrationId,
          registrationCode: response.registrationCode ?? `BX-${response.inviteCode}`,
          inviteCode: response.inviteCode,
          teamName,
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
        const details = error.details as DuplicateRegistrationInfo
        setDuplicateInfo(details)
        if (!options?.silent) toast.error('You are already registered for this event')
        return false
      }

      if (error instanceof ApiClientError && error.code === 'RATE_LIMITED') {
        const details = error.details as QueueInfo
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

  const registrationClosed = event
    ? Date.now() > new Date(event.registrationClose).getTime() || event.status === 'closed'
    : false

  return {
    event: event as Event | undefined,
    isLoading,
    isError,
    registrationsLoading,
    isAuthenticated,
    form,
    currentStep,
    setCurrentStep,
    teamMode,
    wizardSteps,
    wizardStepIndex,
    isSubmitting,
    result,
    duplicateInfo,
    existingRegistration,
    registrationInProgressElsewhere,
    overloadPaused,
    queueInfo,
    isRetryingSubmit,
    registrationClosed,
    handleNext,
    handleBack,
    handleSubmit,
  }
}

export type RegistrationPageState = ReturnType<typeof useRegistrationPage>
