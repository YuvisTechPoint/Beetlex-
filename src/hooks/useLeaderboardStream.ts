import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPublicLeaderboard } from '@/api/leaderboard'
import { getAuthToken } from '@/store/authStore'
import {
  useLeaderboardStore,
  type LeaderboardConnectionMode,
  type LeaderboardScoreEvent,
} from '@/store/leaderboardStore'

const DEBOUNCE_MS = 500
const DEGRADED_POLL_MS = 10_000

interface UseLeaderboardStreamOptions {
  eventId: string
  enabled?: boolean
}

function buildStreamUrl(eventId: string) {
  const token = getAuthToken()
  const base = `/api/leaderboard/${eventId}/stream`
  return token ? `${base}?token=${encodeURIComponent(token)}` : base
}

export function useLeaderboardStream({ eventId, enabled = true }: UseLeaderboardStreamOptions) {
  const queryClient = useQueryClient()
  const eventBufferRef = useRef<LeaderboardScoreEvent[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptRef = useRef(0)

  const setSnapshot = useLeaderboardStore((s) => s.setSnapshot)
  const applyScoreEvents = useLeaderboardStore((s) => s.applyScoreEvents)
  const setConnectionMode = useLeaderboardStore((s) => s.setConnectionMode)
  const connectionMode = useLeaderboardStore((s) => s.connectionMode)
  const entryMap = useLeaderboardStore((s) => s.entries)
  const entries = useMemo(
    () => [...entryMap.values()].sort((a, b) => a.rank - b.rank),
    [entryMap],
  )

  const snapshotQuery = useQuery({
    queryKey: ['leaderboard', eventId, 'snapshot'],
    queryFn: () => getPublicLeaderboard(eventId),
    enabled,
  })

  const degradedQuery = useQuery({
    queryKey: ['leaderboard', eventId, 'degraded'],
    queryFn: () => getPublicLeaderboard(eventId),
    enabled: enabled && connectionMode === 'degraded',
    refetchInterval: DEGRADED_POLL_MS,
  })

  const flushBuffer = useCallback(() => {
    if (eventBufferRef.current.length === 0) return
    const batch = [...eventBufferRef.current]
    eventBufferRef.current = []
    applyScoreEvents(batch)
  }, [applyScoreEvents])

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = undefined
      flushBuffer()
    }, DEBOUNCE_MS)
  }, [flushBuffer])

  const loadSnapshot = useCallback(async () => {
    const data = await getPublicLeaderboard(eventId)
    if (data.published) {
      setSnapshot(data.entries)
    }
    queryClient.setQueryData(['leaderboard', eventId], data)
    return data
  }, [eventId, queryClient, setSnapshot])

  const connectStream = useCallback(() => {
    if (!enabled || !snapshotQuery.data?.published) return

    if (import.meta.env.VITE_STATIC_API) {
      setConnectionMode('degraded')
      return
    }

    eventSourceRef.current?.close()
    setConnectionMode('connecting')

    const es = new EventSource(buildStreamUrl(eventId))
    eventSourceRef.current = es

    es.addEventListener('connected', () => {
      reconnectAttemptRef.current = 0
      setConnectionMode('live')
    })

    es.addEventListener('score_update', (message) => {
      try {
        const event = JSON.parse(message.data) as LeaderboardScoreEvent
        eventBufferRef.current.push(event)
        scheduleFlush()
      } catch {
        // ignore malformed events
      }
    })

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
      setConnectionMode('degraded')
      void loadSnapshot()
    }
  }, [
    enabled,
    eventId,
    loadSnapshot,
    scheduleFlush,
    setConnectionMode,
    snapshotQuery.data?.published,
  ])

  useEffect(() => {
    if (!enabled) return
    if (snapshotQuery.data?.published) {
      setSnapshot(snapshotQuery.data.entries)
      connectStream()
    }
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
    }
  }, [connectStream, enabled, setSnapshot, snapshotQuery.data])

  useEffect(() => {
    if (degradedQuery.data?.published) {
      setSnapshot(degradedQuery.data.entries)
    }
  }, [degradedQuery.data, setSnapshot])

  useEffect(() => {
    if (connectionMode !== 'degraded') return

    const retryTimer = setTimeout(() => {
      reconnectAttemptRef.current += 1
      connectStream()
    }, Math.min(30_000, 2_000 * 2 ** reconnectAttemptRef.current))

    return () => clearTimeout(retryTimer)
  }, [connectStream, connectionMode])

  return {
    entries,
    published: snapshotQuery.data?.published ?? false,
    isLoading: snapshotQuery.isLoading,
    isError: snapshotQuery.isError,
    connectionMode: connectionMode as LeaderboardConnectionMode,
  }
}
