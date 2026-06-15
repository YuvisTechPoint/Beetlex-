import { useMutation, useQueryClient } from '@tanstack/react-query'
import { broadcastAnnouncement, type BroadcastAnnouncementPayload } from '@/api/organizer'

export function useBroadcastAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BroadcastAnnouncementPayload) => broadcastAnnouncement(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['organizer'] })
      queryClient.invalidateQueries({ queryKey: ['events', payload.eventId, 'announcements'] })
    },
  })
}
