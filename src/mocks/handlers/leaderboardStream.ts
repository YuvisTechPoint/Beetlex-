import { http } from 'msw'
import { createSseResponse } from '@/lib/sse'
import { db } from './db'
import { emitNotification } from './notificationBus'
import { generateId, getUserFromRequest } from './helpers'
import type { LeaderboardEntry, Notification } from '@/types'

function bumpLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry {
  const delta = Math.random() > 0.5 ? (Math.random() > 0.5 ? 1 : -1) : 0
  const newScore = Math.max(0, Math.min(100, entry.score + delta * (0.5 + Math.random())))
  return {
    ...entry,
    previousRank: entry.rank,
    score: Number(newScore.toFixed(1)),
    delta,
  }
}

function resortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.score - a.score)
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

export const leaderboardStreamHandlers = [
  http.get('/api/leaderboard/:eventId/stream', ({ request, params }) => {
    const user = getUserFromRequest(request)
    const isOrganizer = user?.role === 'organizer'
    const eventId = params.eventId as string

    if (eventId !== 'evt-active-1' || (!db.leaderboardPublished && !isOrganizer)) {
      return new Response(null, { status: 204 })
    }

    return createSseResponse((send, close) => {
      send('0', 'connected', { eventId, ts: Date.now() })

      const interval = setInterval(
        () => {
          if (db.leaderboard.length === 0) return

          const idx = Math.floor(Math.random() * db.leaderboard.length)
          const bumped = bumpLeaderboardEntry(db.leaderboard[idx])
          db.leaderboard[idx] = bumped
          db.leaderboard = resortLeaderboard(db.leaderboard)
          const updated = db.leaderboard.find((e) => e.teamId === bumped.teamId)!

          db.leaderboardSequence += 1
          send(String(db.leaderboardSequence), 'score_update', {
            sequenceNumber: db.leaderboardSequence,
            teamId: updated.teamId,
            teamName: updated.teamName,
            trackId: updated.trackId,
            score: updated.score,
            delta: updated.delta,
            rank: updated.rank,
            previousRank: updated.previousRank,
          })

          if (updated.delta !== 0) {
            const direction = updated.delta > 0 ? 'moved up' : 'moved down'
            const notification: Notification = {
              id: generateId('notif'),
              title: 'Live leaderboard update',
              message: `${updated.teamName} ${direction} to #${updated.rank} (${updated.score.toFixed(1)} pts)`,
              type: 'score_update',
              priority: 'info',
              createdAt: new Date().toISOString(),
              read: false,
            }
            db.notifications.unshift(notification)
            emitNotification(notification)
          }
        },
        3500 + Math.random() * 1500,
      )

      return () => {
        clearInterval(interval)
        close()
      }
    })
  }),
]
