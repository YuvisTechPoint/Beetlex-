import { useQuery } from '@tanstack/react-query'
import { getOrganizerSubmissions } from '@/api/organizer'

export function useOrganizerSubmissions() {
  return useQuery({
    queryKey: ['organizer', 'submissions'],
    queryFn: getOrganizerSubmissions,
  })
}
