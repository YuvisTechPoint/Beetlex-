import type { User } from '@/types'

export type AuthStreamPayload =
  | { type: 'session'; user: User; token: string }
  | { type: 'signed_out'; token: string | null }

type AuthListener = (payload: AuthStreamPayload) => void

const listeners = new Set<AuthListener>()

export function subscribeAuth(listener: AuthListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitAuth(payload: AuthStreamPayload) {
  for (const listener of listeners) {
    listener(payload)
  }
}
