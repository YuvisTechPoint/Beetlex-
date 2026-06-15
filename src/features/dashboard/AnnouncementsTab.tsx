import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useEventAnnouncements } from '@/hooks/useEventAnnouncements'
import { Skeleton } from '@/components/ui/skeleton'

export function AnnouncementsTab() {
  const { data: team } = useMyTeam()
  const { data: announcements, isLoading } = useEventAnnouncements(team?.eventId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <p className="text-muted-foreground">
          Important updates from organizers. Click an item to mark related notifications as read.
        </p>
      </div>
      <AnnouncementFeed announcements={announcements ?? []} />
    </div>
  )
}
