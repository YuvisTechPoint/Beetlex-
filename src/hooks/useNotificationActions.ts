import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { markAllNotificationsRead, markNotificationRead } from '@/api/notifications'
import { useNotificationStore } from '@/store/notificationStore'

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const markAsReadStore = useNotificationStore((s) => s.markAsRead)
  const markAllAsReadStore = useNotificationStore((s) => s.markAllAsRead)

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadStore(id)
      void markNotificationRead(id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))
        .catch(() => undefined)
    },
    [markAsReadStore, queryClient],
  )

  const markAllAsRead = useCallback(() => {
    markAllAsReadStore()
    void markAllNotificationsRead()
      .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))
      .catch(() => undefined)
  }, [markAllAsReadStore, queryClient])

  return { markAsRead, markAllAsRead }
}
