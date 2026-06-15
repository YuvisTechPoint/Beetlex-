import { useQuery } from '@tanstack/react-query'
import { getEvents, type EventsFilters } from '@/api/events'

export function useEvents(filters: EventsFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => getEvents(filters),
  })
}
