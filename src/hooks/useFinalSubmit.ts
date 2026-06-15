import { useMutation, useQueryClient } from '@tanstack/react-query'
import { finalSubmit } from '@/api/submissions'

export function useFinalSubmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (submissionId: string) => finalSubmit(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['judge'] })
      queryClient.invalidateQueries({ queryKey: ['organizer'] })
    },
  })
}
