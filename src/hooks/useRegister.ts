import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerForEvent, type RegisterEventPayload } from '@/api/events'
import { joinTeam, type JoinTeamPayload } from '@/api/registrations'

export function useRegister() {
  const queryClient = useQueryClient()

  const registerMutation = useMutation({
    mutationFn: ({
      eventId,
      idempotencyKey,
      simulateOverload,
      ...payload
    }: RegisterEventPayload & {
      eventId: string
      idempotencyKey?: string
      simulateOverload?: boolean
    }) => registerForEvent(eventId, payload, { idempotencyKey, simulateOverload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const joinTeamMutation = useMutation({
    mutationFn: ({
      simulateOverload,
      ...payload
    }: JoinTeamPayload & { simulateOverload?: boolean }) => joinTeam(payload, { simulateOverload }),
    onSuccess: (team) => {
      queryClient.setQueryData(['teams', 'me'], team)
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })

  return { registerMutation, joinTeamMutation }
}
