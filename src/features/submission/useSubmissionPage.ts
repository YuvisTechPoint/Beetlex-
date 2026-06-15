import { useState } from 'react'
import { toast } from 'sonner'
import { ApiClientError } from '@/api/client'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useEvent } from '@/hooks/useEvent'
import { useMySubmission } from '@/hooks/useMySubmission'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { useFinalSubmit } from '@/hooks/useFinalSubmit'
import { useCountdown } from '@/hooks/useCountdown'
import { retryWithBackoff } from '@/lib/retry'
import { URGENT_THRESHOLD_MS } from './constants'
import type { SubmissionFormValues } from './schemas'
import { clearSessionDraft, getSubmissionDraftKey } from './useSubmissionForm'

export function useSubmissionPage() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const { data: event, isLoading: eventLoading } = useEvent(team?.eventId)
  const { data: submission, isLoading: submissionLoading, refetch } = useMySubmission()
  const { saveMutation } = useSaveSubmission()
  const finalSubmitMutation = useFinalSubmit()
  const countdown = useCountdown(event?.submissionDeadline)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<SubmissionFormValues | null>(null)
  const [deadlineForced, setDeadlineForced] = useState(false)

  const isLoading = teamLoading || eventLoading || submissionLoading
  const isDeadlinePassed = countdown.isExpired || deadlineForced
  const isUrgent = !isDeadlinePassed && countdown.totalMs < URGENT_THRESHOLD_MS
  const isSubmitted = submission && !submission.isDraft

  const handleSubmitRequest = (values: SubmissionFormValues) => {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingValues || !team) return
    try {
      const saved = await saveMutation.mutateAsync({
        id: submission?.id,
        title: pendingValues.title,
        description: pendingValues.description,
        techStack: pendingValues.techStack,
        demoUrl: pendingValues.demoUrl,
        repoUrl: pendingValues.repoUrl,
        pitchDeckUrl: pendingValues.pitchDeckUrl || undefined,
        videoUrl: pendingValues.videoUrl || undefined,
      })

      await retryWithBackoff(() => finalSubmitMutation.mutateAsync(saved.id), {
        maxAttempts: 3,
        baseDelayMs: 3000,
        jitterMs: 500,
      })

      clearSessionDraft(getSubmissionDraftKey(team.id))
      await refetch()
      setConfirmOpen(false)
      setPendingValues(null)
      toast.success('Project submitted successfully!')
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'DEADLINE_PASSED') {
        setDeadlineForced(true)
        setConfirmOpen(false)
        setPendingValues(null)
        await refetch()
        toast.error('The submission deadline has passed.')
        return
      }
      toast.error('Failed to submit project. Please try again.')
    }
  }

  return {
    team,
    event,
    submission,
    countdown,
    isLoading,
    isDeadlinePassed,
    isUrgent,
    isSubmitted,
    confirmOpen,
    setConfirmOpen,
    pendingValues,
    handleSubmitRequest,
    handleConfirmSubmit,
    isSubmitting: finalSubmitMutation.isPending || saveMutation.isPending,
    isConfirming: finalSubmitMutation.isPending,
  }
}

export type SubmissionPageState = ReturnType<typeof useSubmissionPage>
