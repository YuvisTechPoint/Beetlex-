import { useMutation, useQueryClient } from '@tanstack/react-query'
import { becomeOrganizer, createOrganizerEvent } from '@/api/organizer'
import { useAuthStore } from '@/store/authStore'
import type { CreateEventPayload } from '@/types'

export function useBecomeOrganizer() {
  const patchUser = useAuthStore((s) => s.patchUser)

  return useMutation({
    mutationFn: becomeOrganizer,
    onSuccess: ({ user }) => {
      patchUser(user)
    },
  })
}

export function useCreateOrganizerEvent() {
  const queryClient = useQueryClient()
  const patchUser = useAuthStore((s) => s.patchUser)

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createOrganizerEvent(payload),
    onSuccess: ({ event, user }) => {
      patchUser(user)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.setQueryData(['event', event.id], event)
    },
  })
}
