import type { Notification } from '@/types'

type NotificationListener = (notification: Notification) => void

const listeners = new Set<NotificationListener>()

export function subscribeNotifications(listener: NotificationListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitNotification(notification: Notification) {
  for (const listener of listeners) {
    listener(notification)
  }
}
