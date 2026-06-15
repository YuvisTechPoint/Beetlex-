import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import {
  ALERT_BANNER_LABELS,
  ALERT_BANNER_STYLES,
  type AlertBannerPriority,
} from '@/components/shared/alertBannerStyles'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const PRIORITY_CONFIG = {
  info: {
    label: ALERT_BANNER_LABELS.info,
    className: ALERT_BANNER_STYLES.info.container,
    icon: ALERT_BANNER_STYLES.info.icon,
  },
  warning: {
    label: ALERT_BANNER_LABELS.warning,
    className: ALERT_BANNER_STYLES.warning.container,
    icon: ALERT_BANNER_STYLES.warning.icon,
  },
  urgent: {
    label: ALERT_BANNER_LABELS.urgent,
    className: ALERT_BANNER_STYLES.urgent.container,
    icon: ALERT_BANNER_STYLES.urgent.icon,
  },
} satisfies Record<
  AlertBannerPriority,
  {
    label: string
    className: string
    icon: (typeof ALERT_BANNER_STYLES)[AlertBannerPriority]['icon']
  }
>

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
                <time className="text-xs text-muted-foreground" dateTime={announcement.createdAt}>
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
