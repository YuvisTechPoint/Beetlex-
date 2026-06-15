import { http, HttpResponse } from 'msw'
import { randomNotificationTemplates } from '@/mocks/data'
import { randomGetDelay } from '@/mocks/utils'
import { db } from './db'
import { generateId, requireAuth } from './helpers'

export const notificationHandlers = [
  http.get('/api/notifications', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const now = Date.now()
    if (now - db.lastRandomNotificationAt >= 45_000 && Math.random() > 0.4) {
      const template =
        randomNotificationTemplates[Math.floor(Math.random() * randomNotificationTemplates.length)]
      db.notifications.unshift({
        id: generateId('notif'),
        ...template,
        createdAt: new Date().toISOString(),
        read: false,
      })
      db.lastRandomNotificationAt = now
    }

    return HttpResponse.json(db.notifications)
  }),

  http.patch('/api/notifications/:id/read', async ({ request, params }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    const notification = db.notifications.find((n) => n.id === params.id)
    if (!notification) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Notification not found' },
        { status: 404 },
      )
    }

    notification.read = true
    return HttpResponse.json(notification)
  }),

  http.post('/api/notifications/read-all', async ({ request }) => {
    await randomGetDelay()
    const auth = requireAuth(request)
    if (auth instanceof Response) return auth

    db.notifications.forEach((n) => {
      n.read = true
    })
    return HttpResponse.json({ success: true })
  }),
]
