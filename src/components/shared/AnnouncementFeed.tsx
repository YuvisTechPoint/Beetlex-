import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const PRIORITY_CONFIG = {
  info: {
    label: 'Info',
    className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    icon: Info,
  },
  warning: {
    label: 'Warning',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
    icon: AlertCircle,
  },
} as const

interface AnnouncementFeedProps {
  announcements: Announcement[]
  isLoading?: boolean
  limit?: number
  className?: string
}

export function AnnouncementFeed({
  announcements,
  isLoading,
  limit,
  className,
}: AnnouncementFeedProps) {
  const userId = useAuth().user?.id
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const notifications = useNotificationStore((s) => s.notifications)

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  const items = limit ? announcements.slice(0, limit) : announcements

  if (items.length === 0) {
    return (
      <p className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        No announcements yet
      </p>
    )
  }

  const handleRead = (announcement: Announcement) => {
    const matchingNotification = notifications.find(
      (n) => n.title === announcement.title && !n.read,
    )
    if (matchingNotification) {
      markAsRead(matchingNotification.id)
    }
  }

  return (
    <ul className={cn('space-y-3', className)} role="list">
      {items.map((announcement) => {
        const config = PRIORITY_CONFIG[announcement.priority]
        const Icon = config.icon
        const isRead = userId ? announcement.readBy.includes(userId) : false

        return (
          <li key={announcement.id}>
            <button
              type="button"
              onClick={() => handleRead(announcement)}
              className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50',
                isRead && 'opacity-70',
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn('gap-1', config.className)}>
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {config.label}
                </Badge>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={announcement.createdAt}
                >
                  {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                </time>
              </div>
              <h4 className="font-medium leading-snug">{announcement.title}</h4>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {announcement.message}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
