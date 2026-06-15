import { AlertOctagon, X } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UrgentBanner() {
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationActions().markAsRead

  const urgent = notifications.find((n) => n.priority === 'urgent' && !n.read)
  if (!urgent) return null

  return (
    <div
      className={cn(
        'border-b border-destructive/40 bg-destructive/15',
        'px-4 py-3',
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="container mx-auto flex items-start gap-3 sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <AlertOctagon
            className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-semibold text-destructive">{urgent.title}</p>
            <p className="text-sm text-destructive/90">{urgent.message}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => markAsRead(urgent.id)}
        >
          <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Dismiss
        </Button>
      </div>
    </div>
  )
}
