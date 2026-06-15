import { useQuery } from '@tanstack/react-query'
import { getEvent } from '@/api/events'

interface UseEventOptions {
  refetchInterval?: number
}

export function useEvent(id: string | undefined, options?: UseEventOptions) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id!),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  })
}
