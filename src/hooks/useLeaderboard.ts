import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getLeaderboard,
  getLeaderboardStatus,
  setLeaderboardPublished,
  updateLeaderboard,
  type UpdateLeaderboardPayload,
} from '@/api/organizer'
import { getPublicLeaderboard } from '@/api/leaderboard'
import { useAuth } from '@/hooks/useAuth'

interface UseLeaderboardOptions {
  refetchInterval?: number
  includeStatus?: boolean
  forOrganizer?: boolean
}

export function useLeaderboard(eventId = 'evt-active-1', options: UseLeaderboardOptions = {}) {
  const queryClient = useQueryClient()
  const { refetchInterval, includeStatus, forOrganizer = false } = options
  const role = useAuth().user?.role
  const useOrganizerApi = forOrganizer && role === 'organizer'

  const publicQuery = useQuery({
    queryKey: ['leaderboard', eventId],
    queryFn: () => getPublicLeaderboard(eventId),
    refetchInterval,
    enabled: !useOrganizerApi,
  })

  const organizerQuery = useQuery({
    queryKey: ['organizer', 'leaderboard'],
    queryFn: getLeaderboard,
    refetchInterval,
    enabled: useOrganizerApi,
  })

  const statusQuery = useQuery({
    queryKey: useOrganizerApi
      ? ['organizer', 'leaderboard', 'status']
      : ['leaderboard', eventId, 'status'],
    queryFn: () =>
      useOrganizerApi
        ? getLeaderboardStatus()
        : getPublicLeaderboard(eventId).then((r) => ({ published: r.published })),
    enabled: includeStatus ?? useOrganizerApi,
    refetchInterval: includeStatus || useOrganizerApi ? refetchInterval : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateLeaderboardPayload) => updateLeaderboard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', eventId] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: (published: boolean) => setLeaderboardPublished(published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'leaderboard', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', eventId, 'status'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', eventId] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'activity'] })
    },
  })

  const data = useOrganizerApi ? organizerQuery.data : publicQuery.data?.entries
  const published = useOrganizerApi ? statusQuery.data?.published : publicQuery.data?.published

  return {
    data,
    published,
    isLoading: useOrganizerApi ? organizerQuery.isLoading : publicQuery.isLoading,
    isError: useOrganizerApi ? organizerQuery.isError : publicQuery.isError,
    statusQuery,
    updateMutation,
    publishMutation,
  }
}
