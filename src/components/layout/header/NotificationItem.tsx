import { createElement } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'
import { PRIORITY_STYLES, notificationIcon } from './constants'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={cn(
        'flex w-full gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
        !notification.read && 'bg-muted/50',
      )}
    >
      {createElement(notificationIcon(notification), {
        className: cn('mt-0.5 h-4 w-4 shrink-0', PRIORITY_STYLES[notification.priority]),
        'aria-hidden': true,
      })}
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium leading-snug', !notification.read && 'text-foreground')}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <time
          className="mt-1 block text-[10px] text-muted-foreground"
          dateTime={notification.createdAt}
        >
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </time>
      </div>
      {!notification.read && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
      )}
    </button>
  )
}
