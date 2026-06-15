import { useQuery } from '@tanstack/react-query'
import { getOrganizerActivity } from '@/api/organizer'

export function useOrganizerActivity(refetchInterval = 10_000) {
  return useQuery({
    queryKey: ['organizer', 'activity'],
    queryFn: getOrganizerActivity,
    refetchInterval,
  })
}
