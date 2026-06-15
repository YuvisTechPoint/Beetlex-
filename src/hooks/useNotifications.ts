import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '@/api/notifications'

interface UseNotificationsOptions {
  enabled?: boolean
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30_000,
    enabled,
  })
}
