import { useQuery } from '@tanstack/react-query'
import { getParticipants, type ParticipantQuery } from '@/api/organizer'

export function useParticipants(params?: ParticipantQuery) {
  return useQuery({
    queryKey: ['organizer', 'participants', params ?? {}],
    queryFn: () => getParticipants(params),
    placeholderData: (previous) => previous,
  })
}
