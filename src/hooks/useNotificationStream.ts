import { useEffect, useRef, useState } from 'react'
import { getAuthToken } from '@/store/authStore'
import type { Notification } from '@/types'

function buildNotificationStreamUrl(lastEventId?: string) {
  const token = getAuthToken()
  const params = new URLSearchParams()
  if (token) params.set('token', token)
  if (lastEventId) params.set('lastEventId', lastEventId)
  const query = params.toString()
  return `/api/notifications/stream${query ? `?${query}` : ''}`
}

interface UseNotificationStreamOptions {
  enabled?: boolean
  onNotification: (notification: Notification) => void
}

export function useNotificationStream({
  enabled = true,
  onNotification,
}: UseNotificationStreamOptions) {
  const [isLive, setIsLive] = useState(false)
  const lastEventIdRef = useRef<string | undefined>(undefined)
  const onNotificationRef = useRef(onNotification)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    if (!enabled) {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      setIsLive(false)
      return
    }

    const es = new EventSource(buildNotificationStreamUrl(lastEventIdRef.current))
    eventSourceRef.current = es

    es.addEventListener('connected', () => {
      setIsLive(true)
    })

    es.addEventListener('notification', (message) => {
      try {
        const notification = JSON.parse(message.data) as Notification
        lastEventIdRef.current = message.lastEventId || notification.id
        onNotificationRef.current(notification)
      } catch {
        // ignore malformed events
      }
    })

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
      setIsLive(false)
    }

    return () => {
      es.close()
      eventSourceRef.current = null
      setIsLive(false)
    }
  }, [enabled])

  return { isLive }
}
