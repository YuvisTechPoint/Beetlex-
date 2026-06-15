import { useQuery } from '@tanstack/react-query'
import { getParticipants } from '@/api/organizer'

export function useParticipants() {
  return useQuery({
    queryKey: ['organizer', 'participants'],
    queryFn: getParticipants,
  })
}
