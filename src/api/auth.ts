import { apiClient } from '@/api/client'
import type { User, UserRole } from '@/types'

export interface AuthSessionResponse {
  user: User
  token: string
}

export function loginWithRole(role: UserRole) {
  return apiClient.post<AuthSessionResponse>('/auth/login', { role })
}

export function loginWithEmail(email: string) {
  return apiClient.post<AuthSessionResponse>('/auth/login', { email })
}

export function fetchCurrentSession() {
  return apiClient.get<AuthSessionResponse>('/auth/me')
}

export function logoutSession() {
  return apiClient.post<{ success: boolean }>('/auth/logout')
}

export function buildAuthStreamUrl(token: string) {
  const params = new URLSearchParams({ token })
  return `/api/auth/stream?${params.toString()}`
}
