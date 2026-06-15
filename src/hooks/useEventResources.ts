import { useQuery } from '@tanstack/react-query'
import { getEventResources } from '@/api/events'

export function useEventResources(eventId: string | undefined) {
  return useQuery({
    queryKey: ['events', eventId, 'resources'],
    queryFn: () => getEventResources(eventId!),
    enabled: Boolean(eventId),
    staleTime: 60_000,
  })
}
