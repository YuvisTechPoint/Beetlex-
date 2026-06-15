import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchCurrentSession, loginWithRole, logoutSession } from '@/api/auth'
import { ApiClientError } from '@/api/client'
import type { User, UserRole } from '@/types'

const AUTH_CHANNEL = 'beetlex-auth-sync'
const AUTH_STORAGE_KEY = 'beetlex-auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  login: (role: UserRole) => Promise<void>
  logout: () => Promise<void>
  setSession: (user: User | null, token: string | null) => void
  clearSession: () => void
  hydrate: () => Promise<void>
}

function broadcastAuth(payload: {
  type: 'session' | 'signed_out'
  user?: User | null
  token?: string | null
}) {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.postMessage(payload)
  channel.close()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,

      setSession: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: Boolean(user && token),
          error: null,
        })
      },

      clearSession: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isHydrated: true,
          isLoading: false,
          error: null,
        })
      },

      hydrate: async () => {
        const { token } = get()
        if (!token) {
          set({ isHydrated: true, isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const session = await fetchCurrentSession()
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const message =
            error instanceof ApiClientError ? error.message : 'Session expired. Please sign in again.'
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHydrated: true,
            isLoading: false,
            error: message,
          })
        }
      },

      login: async (role: UserRole) => {
        set({ isLoading: true, error: null })
        try {
          const session = await loginWithRole(role)
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          })
          broadcastAuth({ type: 'session', user: session.user, token: session.token })
        } catch (error) {
          const message =
            error instanceof ApiClientError ? error.message : 'Unable to sign in. Please try again.'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      logout: async () => {
        const { token } = get()
        set({ isLoading: true, error: null })
        try {
          if (token) {
            await logoutSession()
          }
        } catch {
          // Clear locally even when API fails
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isHydrated: true,
          isLoading: false,
          error: null,
        })
        broadcastAuth({ type: 'signed_out', token })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            useAuthStore.setState({ isHydrated: true })
            return
          }
          void useAuthStore.getState().hydrate()
        }
      },
    },
  ),
)

export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

export function getAuthUser(): User | null {
  return useAuthStore.getState().user
}

export function clearAuthSession() {
  useAuthStore.getState().clearSession()
}

export { AUTH_CHANNEL, AUTH_STORAGE_KEY }
