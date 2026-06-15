import { useCallback, useEffect, useRef, type MutableRefObject } from 'react'
import { toast } from 'sonner'
import type { Notification } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { useUiStore } from '@/store/uiStore'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotificationStream } from '@/hooks/useNotificationStream'

const DEFAULT_TITLE = 'BeetleX'
const TOAST_DURATIONS = {
  info: 5_000,
  warning: 8_000,
} as const

function playUrgentSound() {
  if (!useUiStore.getState().notificationSoundsEnabled) return
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    gain.gain.value = 0.05
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.15)
  } catch {
    // Audio not available
  }
}

function showNotificationToast(notification: Notification) {
  if (notification.priority === 'urgent') return

  const duration =
    notification.type === 'deadline_alert'
      ? 10_000
      : notification.type === 'score_update'
        ? 6_000
        : (TOAST_DURATIONS[notification.priority as keyof typeof TOAST_DURATIONS] ?? 5_000)

  if (notification.type === 'score_update') {
    toast.info(notification.title, {
      id: notification.id,
      description: notification.message,
      duration,
    })
    return
  }

  if (notification.type === 'deadline_alert') {
    toast.warning(notification.title, {
      id: notification.id,
      description: notification.message,
      duration,
    })
    return
  }

  const toastFn = notification.priority === 'warning' ? toast.warning : toast.info
  toastFn(notification.title, {
    id: notification.id,
    description: notification.message,
    duration,
  })
}

function deliverNotification(
  notification: Notification,
  seenIdsRef: MutableRefObject<Set<string>>,
  addNotification: (n: Notification) => void,
  bufferedToastsRef: MutableRefObject<Notification[]>,
) {
  if (seenIdsRef.current.has(notification.id)) return
  seenIdsRef.current.add(notification.id)
  addNotification(notification)

  if (notification.priority === 'urgent') {
    playUrgentSound()
  }

  if (document.hidden) {
    if (notification.priority !== 'urgent') {
      bufferedToastsRef.current.push(notification)
    }
    if (notification.priority === 'urgent') {
      document.title = `🔴 Urgent: ${notification.title} — BeetleX`
    } else {
      const unread = useNotificationStore.getState().unreadCount()
      if (unread > 0) {
        document.title = `(${unread}) BeetleX Dashboard`
      }
    }
  } else {
    showNotificationToast(notification)
    if (notification.priority === 'urgent') {
      document.title = `🔴 Urgent: ${notification.title} — BeetleX`
    }
  }
}

export function useNotificationSync() {
  const { isAuthenticated } = useAuth()
  const { data } = useNotifications({ enabled: isAuthenticated })
  const syncFromApi = useNotificationStore((s) => s.syncFromApi)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const isInitialRef = useRef(true)
  const defaultTitleRef = useRef(DEFAULT_TITLE)
  const bufferedToastsRef = useRef<Notification[]>([])

  const handleStreamNotification = useCallback(
    (notification: Notification) => {
      deliverNotification(notification, seenIdsRef, addNotification, bufferedToastsRef)
    },
    [addNotification],
  )

  const { isLive } = useNotificationStream({
    enabled: isAuthenticated,
    onNotification: handleStreamNotification,
  })

  const flushBufferedToasts = () => {
    for (const notification of bufferedToastsRef.current) {
      showNotificationToast(notification)
    }
    bufferedToastsRef.current = []

    const unread = useNotificationStore.getState().unreadCount()
    document.title = unread > 0 ? `(${unread}) BeetleX Dashboard` : defaultTitleRef.current
  }

  useEffect(() => {
    defaultTitleRef.current = document.title || DEFAULT_TITLE

    const handleVisibility = () => {
      if (!document.hidden) {
        flushBufferedToasts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (!data) return

    if (isInitialRef.current) {
      data.forEach((n) => seenIdsRef.current.add(n.id))
      syncFromApi(data)
      isInitialRef.current = false
      return
    }

    syncFromApi(data)

    if (isLive) return

    for (const notification of data) {
      deliverNotification(notification, seenIdsRef, addNotification, bufferedToastsRef)
    }
  }, [data, syncFromApi, addNotification, isLive])
}
