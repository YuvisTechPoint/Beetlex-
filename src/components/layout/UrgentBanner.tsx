import { useNotificationStore } from '@/store/notificationStore'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { AlertBanner } from '@/components/shared/AlertBanner'

export function UrgentBanner() {
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationActions().markAsRead

  const urgent = notifications.find((n) => n.priority === 'urgent' && !n.read)
  if (!urgent) return null

  return (
    <AlertBanner
      priority="urgent"
      title={urgent.title}
      description={urgent.message}
      onDismiss={() => markAsRead(urgent.id)}
      dismissLabel={`Dismiss: ${urgent.title}`}
      flush
      contained={false}
    />
  )
}
