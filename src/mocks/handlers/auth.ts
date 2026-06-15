import { http, HttpResponse } from 'msw'
import type { User, UserRole } from '@/types'
import { createSseResponse } from '@/lib/sse'
import { randomGetDelay } from '@/mocks/utils'
import { db } from './db'
import { emitAuth, subscribeAuth } from './authBus'
import {
  bindFirebaseSession,
  createMockSessionToken,
  resolveUserFromFirebaseToken,
} from './firebaseAuth'
import { getUserFromRequest, jsonError, revokeAuthToken } from './helpers'

const DEV_USER_IDS: Record<UserRole, string> = {
  participant: 'user-participant-1',
  judge: 'user-judge-1',
  organizer: 'user-organizer-1',
}

function findUserById(userId: string): User | undefined {
  return db.users.find((user) => user.id === userId)
}

function createSession(user: User) {
  return createMockSessionToken(user)
}

function sessionResponse(user: User, token: string) {
  return {
    user,
    token,
    session: db.authSessions[token],
  }
}

function invalidateToken(token: string | null | undefined) {
  revokeAuthToken(token)
}

function invalidateUserSessions(userId: string, exceptToken?: string) {
  for (const [token, session] of Object.entries(db.authSessions)) {
    if (session.userId === userId && token !== exceptToken) {
      invalidateToken(token)
      emitAuth({ type: 'signed_out', token })
    }
  }
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await randomGetDelay()
    const body = (await request.json()) as {
      role?: UserRole
      email?: string
      firebaseIdToken?: string
    }

    if (body.firebaseIdToken) {
      const user = resolveUserFromFirebaseToken(body.firebaseIdToken)
      if (!user) {
        return jsonError('INVALID_CREDENTIALS', 'Invalid or expired Google session', 401)
      }

      const token = body.firebaseIdToken
      bindFirebaseSession(token, user)
      invalidateUserSessions(user.id, token)
      const payload = sessionResponse(user, token)
      emitAuth({ type: 'session', user, token })
      return HttpResponse.json(payload)
    }

    let user: User | undefined

    if (body.role) {
      const userId = DEV_USER_IDS[body.role]
      user = findUserById(userId)
    } else if (body.email) {
      user = db.users.find((entry) => entry.email.toLowerCase() === body.email!.toLowerCase())
    }

    if (!user) {
      return jsonError('INVALID_CREDENTIALS', 'Invalid role or email', 401)
    }

    const token = createSession(user)
    invalidateUserSessions(user.id, token)
    const payload = sessionResponse(user, token)
    emitAuth({ type: 'session', user, token })
    return HttpResponse.json(payload)
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await randomGetDelay()
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
      invalidateToken(token)
      emitAuth({ type: 'signed_out', token })
    }

    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await randomGetDelay()
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return jsonError('UNAUTHORIZED', 'Authentication required', 401)
    }

    const user = getUserFromRequest(request)
    if (!user) {
      return jsonError('UNAUTHORIZED', 'Session expired', 401)
    }

    if (db.authSessions[token]) {
      db.authSessions[token].lastSeenAt = new Date().toISOString()
    }

    return HttpResponse.json({ user, token })
  }),

  http.get('/api/auth/stream', ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) {
      return jsonError('UNAUTHORIZED', 'Authentication required', 401)
    }

    const authHeader = request.headers.get('Authorization')
    const url = new URL(request.url)
    const token =
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ??
      url.searchParams.get('token')

    if (!token) {
      return jsonError('UNAUTHORIZED', 'Missing session token', 401)
    }

    if (!getUserFromRequest(request)) {
      return jsonError('UNAUTHORIZED', 'Session expired', 401)
    }

    return createSseResponse((send, close) => {
      let sequence = 0
      send(String(sequence), 'connected', { userId: user.id, token })

      const unsubscribe = subscribeAuth((payload) => {
        if (payload.type === 'session' && payload.token === token) {
          sequence += 1
          send(String(sequence), 'session', payload)
        }
        if (payload.type === 'signed_out' && payload.token === token) {
          sequence += 1
          send(String(sequence), 'signed_out', payload)
          close()
        }
      })

      const userRecord = findUserById(user.id)
      if (userRecord) {
        const interval = setInterval(() => {
          const latest = findUserById(user.id)
          if (!latest || !db.authSessions[token]) return
          db.authSessions[token].lastSeenAt = new Date().toISOString()
          sequence += 1
          send(String(sequence), 'session', {
            type: 'session',
            user: latest,
            token,
          })
        }, 30_000)

        return () => {
          clearInterval(interval)
          unsubscribe()
        }
      }

      return unsubscribe
    })
  }),
]
