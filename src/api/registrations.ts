import { apiClient } from './client'
import type { Registration, Team } from '@/types'

export function getMyRegistrations() {
  return apiClient.get<Registration[]>('/registrations/me')
}

export interface JoinTeamPayload {
  inviteCode: string
}

export interface JoinTeamOptions {
  simulateOverload?: boolean
}

export function verifyInviteCode(payload: JoinTeamPayload) {
  return apiClient.post<Team>('/teams/verify', payload)
}

export function joinTeam(payload: JoinTeamPayload, options?: JoinTeamOptions) {
  const headers: HeadersInit = {}
  if (options?.simulateOverload) {
    headers['X-Simulate-Overload'] = '1'
  }
  return apiClient.post<Team>('/teams/join', payload, { headers })
}

export function leaveTeam() {
  return apiClient.post<{ success: boolean }>('/teams/me/leave', {})
}

export function removeTeamMember(userId: string) {
  return apiClient.delete<Team>(`/teams/me/members/${userId}`)
}

export function getMyTeam() {
  return apiClient.get<Team | null>('/teams/me')
}
