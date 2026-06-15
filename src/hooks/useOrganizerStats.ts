import { useQuery } from '@tanstack/react-query'
import { getOrganizerStats } from '@/api/organizer'

export function useOrganizerStats() {
  return useQuery({
    queryKey: ['organizer', 'stats'],
    queryFn: getOrganizerStats,
  })
}
