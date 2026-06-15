import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'read'> & { read?: boolean }) => void
  syncFromApi: (apiNotifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, read: notification.read ?? false },
            ...state.notifications.filter((n) => n.id !== notification.id),
          ].slice(0, 50),
        })),
      syncFromApi: (apiNotifications) =>
        set((state) => {
          const localById = new Map(state.notifications.map((n) => [n.id, n]))
          return {
            notifications: apiNotifications.map((api) => {
              const local = localById.get(api.id)
              return local ? { ...api, read: local.read || api.read } : api
            }),
          }
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearAll: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'beetlex-notifications', storage: createJSONStorage(() => localStorage) },
  ),
)
