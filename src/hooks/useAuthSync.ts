import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { buildAuthStreamUrl } from '@/api/auth'
import { AUTH_CHANNEL, AUTH_STORAGE_KEY, useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

interface AuthStreamSession {
  type: 'session'
  user: User
  token: string
}

function syncQueryCache(queryClient: ReturnType<typeof useQueryClient>, isAuthenticated: boolean) {
  if (isAuthenticated) {
    void queryClient.invalidateQueries({ queryKey: ['registrations'] })
    void queryClient.invalidateQueries({ queryKey: ['teams'] })
    void queryClient.invalidateQueries({ queryKey: ['submissions'] })
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    return
  }

  queryClient.removeQueries({ queryKey: ['registrations'] })
  queryClient.removeQueries({ queryKey: ['teams'] })
  queryClient.removeQueries({ queryKey: ['submissions'] })
  queryClient.removeQueries({ queryKey: ['notifications'] })
}

export function useAuthSync() {
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const eventSourceRef = useRef<EventSource | null>(null)
  const lastAuthKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isHydrated) {
      void hydrate()
    }
  }, [hydrate, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    const authKey = token ?? 'guest'
    if (lastAuthKeyRef.current === authKey) return
    lastAuthKeyRef.current = authKey
    syncQueryCache(queryClient, isAuthenticated)
  }, [token, isAuthenticated, isHydrated, queryClient])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(AUTH_CHANNEL)
    channel.onmessage = (event: MessageEvent<{ type: string; user?: User; token?: string | null }>) => {
      if (event.data.type === 'session' && event.data.user && event.data.token) {
        setSession(event.data.user, event.data.token)
      }
      if (event.data.type === 'signed_out') {
        clearSession()
      }
    }

    return () => channel.close()
  }, [setSession, clearSession])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return
      void hydrate()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [hydrate])

  useEffect(() => {
    const handleFocus = () => {
      if (useAuthStore.getState().token) {
        void hydrate()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [hydrate])

  useEffect(() => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null

    if (!token || !isHydrated || !isAuthenticated) return

    const es = new EventSource(buildAuthStreamUrl(token))
    eventSourceRef.current = es

    es.addEventListener('session', (message) => {
      try {
        const payload = JSON.parse(message.data) as AuthStreamSession
        if (payload.token === token) {
          setSession(payload.user, payload.token)
        }
      } catch {
        // ignore malformed events
      }
    })

    es.addEventListener('signed_out', () => {
      clearSession()
    })

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [token, isHydrated, isAuthenticated, setSession, clearSession])
}
