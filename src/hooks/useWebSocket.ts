import { useCallback, useEffect, useRef, useState } from 'react'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected'

export interface WebSocketMessage {
  type: string
  payload?: unknown
  at: string
}

interface UseWebSocketOptions {
  enabled?: boolean
}

const MAX_BACKOFF_MS = 30_000
const HEARTBEAT_MS = 15_000
const MOCK_WS_URL = 'wss://mock.beetlex.dev/events'

/**
 * Simulated WebSocket for development — mirrors platform event stream behavior.
 * Production would connect to a real WSS endpoint (Ably, Pusher, etc.).
 */
export function useWebSocket(url: string | null = MOCK_WS_URL, options: UseWebSocketOptions = {}) {
  const { enabled = Boolean(url) } = options
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const reconnectAttemptRef = useRef(0)
  const sendQueueRef = useRef<unknown[]>([])

  const send = useCallback(
    (data: unknown) => {
      if (status !== 'connected') {
        sendQueueRef.current.push(data)
        return false
      }
      setLastMessage({
        type: 'sent',
        payload: data,
        at: new Date().toISOString(),
      })
      return true
    },
    [status],
  )

  useEffect(() => {
    if (!enabled || !url) {
      setStatus('disconnected')
      return
    }

    let cancelled = false
    let connectTimer: ReturnType<typeof setTimeout> | undefined
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined

    const clearTimers = () => {
      if (connectTimer) clearTimeout(connectTimer)
      if (heartbeatTimer) clearInterval(heartbeatTimer)
    }

    const connect = () => {
      if (cancelled) return
      setStatus('connecting')

      const attempt = reconnectAttemptRef.current
      const delay =
        attempt === 0 ? 300 : Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS) + Math.random() * 500

      connectTimer = setTimeout(() => {
        if (cancelled) return
        reconnectAttemptRef.current = 0
        setStatus('connected')
        setLastMessage({
          type: 'open',
          payload: { url },
          at: new Date().toISOString(),
        })

        while (sendQueueRef.current.length > 0) {
          const queued = sendQueueRef.current.shift()
          setLastMessage({
            type: 'sent',
            payload: queued,
            at: new Date().toISOString(),
          })
        }

        heartbeatTimer = setInterval(() => {
          if (cancelled) return
          setLastMessage({
            type: 'heartbeat',
            at: new Date().toISOString(),
          })
        }, HEARTBEAT_MS)
      }, delay)
    }

    const handleOffline = () => {
      if (cancelled) return
      clearTimers()
      reconnectAttemptRef.current += 1
      setStatus('disconnected')
      setLastMessage({
        type: 'close',
        at: new Date().toISOString(),
      })
      connect()
    }

    connect()
    window.addEventListener('offline', handleOffline)

    return () => {
      cancelled = true
      clearTimers()
      window.removeEventListener('offline', handleOffline)
      setStatus('disconnected')
    }
  }, [enabled, url])

  return { status, lastMessage, send }
}

export { MOCK_WS_URL }
