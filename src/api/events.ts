import { apiClient } from './client'
import type { Announcement, Event, PaginatedResponse } from '@/types'

export interface EventsFilters {
  status?: Event['status']
  track?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface RegisterEventPayload {
  teamName: string
  trackId: string
  profile?: {
    phone?: string
    college?: string
    organization?: string
    projectRole: string
    linkedinUrl?: string
    githubUsername?: string
    bio?: string
  }
}

export function getEvents(filters: EventsFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.track) params.set('track', filters.track)
  if (filters.search) params.set('search', filters.search)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  const query = params.toString()
  return apiClient.get<PaginatedResponse<Event>>(`/events${query ? `?${query}` : ''}`)
}

export function getEvent(id: string) {
  return apiClient.get<Event>(`/events/${id}`)
}

export function registerForEvent(
  eventId: string,
  payload: RegisterEventPayload,
  options?: { idempotencyKey?: string; simulateOverload?: boolean },
) {
  const headers: HeadersInit = {}
  if (options?.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey
  }
  if (options?.simulateOverload) {
    headers['X-Simulate-Overload'] = '1'
  }

  return apiClient.post<{
    registrationId: string
    registrationCode: string
    teamId: string
    inviteCode: string
    team: unknown
  }>(`/events/${eventId}/register`, payload, { headers })
}

export function getEventAnnouncements(eventId: string) {
  return apiClient.get<Announcement[]>(`/events/${eventId}/announcements`)
}
