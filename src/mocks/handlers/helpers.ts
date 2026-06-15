import type { User } from '@/types'
import { isFirebaseIdToken } from '@/lib/firebaseJwt'
import { bindFirebaseSession, resolveUserFromFirebaseToken } from '@/mocks/handlers/firebaseAuth'
import { db } from './db'

export function jsonError(code: string, message: string, status: number, details?: unknown) {
  return Response.json({ code, message, details }, { status })
}

function parseUserIdFromToken(token: string): string | null {
  const legacy = token.match(/^mock-token-(?:participant|judge|organizer)-(.+)$/)
  if (!legacy?.[1]) return null

  const rest = legacy[1]
  const sessIdx = rest.indexOf('-sess-')
  return sessIdx >= 0 ? rest.slice(0, sessIdx) : rest
}

export function restoreSessionFromToken(token: string): User | null {
  if (db.revokedTokens.has(token)) return null

  const session = db.authSessions[token]
  if (session) {
    return db.users.find((user) => user.id === session.userId) ?? null
  }

  if (isFirebaseIdToken(token)) {
    const user = resolveUserFromFirebaseToken(token)
    if (!user) return null
    bindFirebaseSession(token, user)
    return user
  }

  const userId = parseUserIdFromToken(token)
  if (!userId) return null

  const user = db.users.find((entry) => entry.id === userId)
  if (!user) return null

  const now = new Date().toISOString()
  db.authSessions[token] = {
    token,
    userId: user.id,
    createdAt: now,
    lastSeenAt: now,
  }
  return user
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7)
  }

  const url = new URL(request.url)
  return url.searchParams.get('token')
}

export function getUserFromRequest(request: Request): User | null {
  const token = extractToken(request)
  if (!token) return null
  return restoreSessionFromToken(token)
}

export function requireAuth(request: Request): User | Response {
  const user = getUserFromRequest(request)
  if (!user) {
    return jsonError('UNAUTHORIZED', 'Authentication required', 401)
  }
  return user
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function revokeAuthToken(token: string | null | undefined) {
  if (!token) return
  delete db.authSessions[token]
  db.revokedTokens.add(token)
}
