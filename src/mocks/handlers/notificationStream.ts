import { http } from 'msw'
import { createSseResponse } from '@/lib/sse'
import { randomNotificationTemplates } from '@/mocks/data'
import { db } from './db'
import { generateId, getUserFromRequest } from './helpers'
import type { Notification } from '@/types'

export const notificationStreamHandlers = [
  http.get('/api/notifications/stream', ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) {
      return new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(request.url)
    const lastEventId = url.searchParams.get('lastEventId') ?? '0'

    return createSseResponse((send, close) => {
      send('0', 'connected', { ts: Date.now() })

      const alreadySent = new Set<string>()
      for (const notification of db.notifications) {
        if (notification.id > lastEventId) {
          alreadySent.add(notification.id)
        }
      }

      const interval = setInterval(() => {
        if (Math.random() > 0.55) return

        const template =
          randomNotificationTemplates[
            Math.floor(Math.random() * randomNotificationTemplates.length)
          ]
        const notification: Notification = {
          id: generateId('notif'),
          ...template,
          createdAt: new Date().toISOString(),
          read: false,
        }

        db.notifications.unshift(notification)
        db.lastRandomNotificationAt = Date.now()
        send(notification.id, 'notification', notification)
      }, 20_000)

      return () => {
        clearInterval(interval)
        close()
      }
    })
  }),
]
