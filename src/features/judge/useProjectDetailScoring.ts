import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useAuth } from '@/hooks/useAuth'
import type { Submission } from '@/types'
import {
  DEFAULT_SCORE_VALUES,
  computeTotalScore,
  scoringSchema,
  type ScoringFormValues,
} from './schemas'

interface UseProjectDetailScoringOptions {
  submission: Submission | undefined
  submissionId: string
  onScored?: () => void
}

export function useProjectDetailScoring({
  submission,
  submissionId,
  onScored,
}: UseProjectDetailScoringOptions) {
  const { user } = useAuth()
  const submitScore = useSubmitScore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<ScoringFormValues | null>(null)

  const existingScore = useMemo(() => {
    if (!submission?.scores || !user) return null
    return submission.scores.find((s) => s.judgeId === user.id) ?? null
  }, [submission?.scores, user])

  const form = useForm<ScoringFormValues>({
    resolver: zodResolver(scoringSchema),
    defaultValues: DEFAULT_SCORE_VALUES,
    mode: 'onChange',
  })

  const watched = form.watch()
  const totalScore = computeTotalScore(watched)
  const isAlreadyScored = Boolean(existingScore)

  useEffect(() => {
    if (existingScore) {
      form.reset({
        innovation: existingScore.innovation,
        technicalExecution: existingScore.technicalExecution,
        impact: existingScore.impact,
        presentation: existingScore.presentation,
        comments: existingScore.comments,
      })
    } else {
      form.reset(DEFAULT_SCORE_VALUES)
    }
  }, [existingScore, submissionId, form])

  const handleValidateAndConfirm = form.handleSubmit((values) => {
    setPendingValues(values)
    setConfirmOpen(true)
  })

  const handleConfirmSubmit = async () => {
    if (!pendingValues) return
    try {
      await submitScore.mutateAsync({
        submissionId,
        ...pendingValues,
      })
      toast.success(isAlreadyScored ? 'Score updated' : 'Score submitted')
      setConfirmOpen(false)
      setPendingValues(null)
      onScored?.()
    } catch {
      toast.error('Failed to submit score')
    }
  }

  return {
    form,
    existingScore,
    totalScore,
    isAlreadyScored,
    confirmOpen,
    setConfirmOpen,
    pendingValues,
    handleValidateAndConfirm,
    handleConfirmSubmit,
    isSubmitting: submitScore.isPending,
  }
}
