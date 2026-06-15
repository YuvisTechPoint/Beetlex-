import { apiClient } from './client'
import type { Notification } from '@/types'

export function getNotifications() {
  return apiClient.get<Notification[]>('/notifications')
}

export function markNotificationRead(id: string) {
  return apiClient.patch<Notification>(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return apiClient.post<{ success: boolean }>('/notifications/read-all')
}
