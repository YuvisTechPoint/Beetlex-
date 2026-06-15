import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitScore, type SubmitScorePayload } from '@/api/judges'

export function useSubmitScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ submissionId, ...payload }: SubmitScorePayload & { submissionId: string }) =>
      submitScore(submissionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['judge'] })
      queryClient.invalidateQueries({ queryKey: ['judge', 'submissions', variables.submissionId] })
      queryClient.invalidateQueries({ queryKey: ['organizer'] })
    },
  })
}
