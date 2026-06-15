import type { User } from '@/types'
import { decodeFirebaseIdToken, type FirebaseIdTokenClaims } from '@/lib/firebaseJwt'
import { db } from './db'

function generateSessionId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function resolveUserFromFirebaseToken(token: string): User | null {
  const claims = decodeFirebaseIdToken(token)
  if (!claims) return null
  return resolveUserFromFirebaseClaims(claims)
}

export function resolveUserFromFirebaseClaims(claims: FirebaseIdTokenClaims): User {
  const email = claims.email?.toLowerCase()

  if (email) {
    const existing = db.users.find((entry) => entry.email.toLowerCase() === email)
    if (existing) {
      if (claims.picture && existing.avatarUrl !== claims.picture) {
        existing.avatarUrl = claims.picture
      }
      if (claims.name && existing.name !== claims.name) {
        existing.name = claims.name
      }
      return existing
    }
  }

  const user: User = {
    id: `user-firebase-${claims.sub}`,
    name: claims.name ?? email?.split('@')[0] ?? 'Google User',
    email: email ?? `${claims.sub}@users.firebase.local`,
    role: 'participant',
    avatarUrl: claims.picture,
  }

  db.users.push(user)
  return user
}

export function bindFirebaseSession(token: string, user: User) {
  const now = new Date().toISOString()
  db.authSessions[token] = {
    token,
    userId: user.id,
    createdAt: now,
    lastSeenAt: now,
  }
}

export function createMockSessionToken(user: User): string {
  const token = `mock-token-${user.role}-${user.id}-${generateSessionId('sess')}`
  bindFirebaseSession(token, user)
  return token
}
