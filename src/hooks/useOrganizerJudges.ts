import { useQuery } from '@tanstack/react-query'
import { getOrganizerJudges } from '@/api/organizer'

export function useOrganizerJudges() {
  return useQuery({
    queryKey: ['organizer', 'judges'],
    queryFn: getOrganizerJudges,
  })
}
