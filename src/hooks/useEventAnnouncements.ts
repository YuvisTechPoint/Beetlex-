import { useQuery } from '@tanstack/react-query'
import { getEventAnnouncements } from '@/api/events'

export function useEventAnnouncements(eventId: string | undefined) {
  return useQuery({
    queryKey: ['events', eventId, 'announcements'],
    queryFn: () => getEventAnnouncements(eventId!),
    enabled: Boolean(eventId),
    refetchInterval: 30_000,
  })
}
