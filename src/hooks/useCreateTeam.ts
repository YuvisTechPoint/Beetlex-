import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeam, type CreateTeamPayload } from '@/api/registrations'

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => createTeam(payload),
    onSuccess: (result) => {
      queryClient.setQueryData(['teams', 'me'], result.team)
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
