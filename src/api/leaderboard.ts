import { apiClient } from './client'
import type { LeaderboardEntry } from '@/types'

export function getPublicLeaderboard(eventId: string) {
  return apiClient.get<{ published: boolean; entries: LeaderboardEntry[] }>(
    `/leaderboard/${eventId}`,
  )
}

export function getPublicLeaderboardStatus(eventId: string) {
  return apiClient.get<{ published: boolean }>(`/leaderboard/${eventId}/status`)
}

export function publishLeaderboard(eventId: string, published: boolean) {
  return apiClient.put<{ published: boolean }>(`/leaderboard/${eventId}/publish`, { published })
}
