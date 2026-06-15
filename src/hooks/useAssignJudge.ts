import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignJudge, assignSubmissionJudge, type AssignJudgePayload } from '@/api/organizer'

export function useAssignJudge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AssignJudgePayload) => assignJudge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'judges'] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'activity'] })
    },
  })
}

export function useAssignSubmissionJudge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignSubmissionJudge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'submissions'] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'judges'] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'activity'] })
    },
  })
}
