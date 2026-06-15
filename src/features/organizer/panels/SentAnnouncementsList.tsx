import { formatDistanceToNow } from 'date-fns'
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'
import { formatDateTime } from '@/utils'
import { ANNOUNCEMENT_PRIORITY_PREVIEW } from './announcementConstants'

interface SentAnnouncementsListProps {
  announcements: Announcement[]
  totalParticipants: number
  isLoading: boolean
}

export function SentAnnouncementsList({
  announcements,
  totalParticipants,
  isLoading,
}: SentAnnouncementsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (announcements.length === 0) {
    return <AnnouncementFeed announcements={[]} />
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const readCount = announcement.readBy.length
        return (
          <div key={announcement.id} className="rounded-lg border p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'gap-1',
                  ANNOUNCEMENT_PRIORITY_PREVIEW[announcement.priority].className,
                )}
              >
                {ANNOUNCEMENT_PRIORITY_PREVIEW[announcement.priority].label}
              </Badge>
              <time className="text-xs text-muted-foreground" dateTime={announcement.createdAt}>
                {formatDateTime(announcement.createdAt)} (
                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })})
              </time>
            </div>
            <h4 className="font-medium">{announcement.title}</h4>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {announcement.message}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Read by {readCount}/{totalParticipants} participants
            </p>
          </div>
        )
      })}
    </div>
  )
}
