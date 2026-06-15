import { useMemo } from 'react'
import { useEventAnnouncements } from '@/hooks/useEventAnnouncements'
import { useParticipants } from '@/hooks/useParticipants'
import { AnnouncementComposeForm } from './AnnouncementComposeForm'
import { DEFAULT_EVENT_ID } from '../types'
import { SentAnnouncementsList } from './SentAnnouncementsList'

export default function AnnouncementsPanel() {
  const { data: announcements, isLoading } = useEventAnnouncements(DEFAULT_EVENT_ID)
  const { data: participantsPage } = useParticipants()
  const totalParticipants = participantsPage?.total ?? 0

  const sentAnnouncements = useMemo(
    () =>
      [...(announcements ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [announcements],
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <p className="text-muted-foreground">Compose and broadcast updates to participants</p>
      </div>

      <AnnouncementComposeForm totalParticipants={totalParticipants} />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sent Announcements</h3>
        <SentAnnouncementsList
          announcements={sentAnnouncements}
          totalParticipants={totalParticipants}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
