import type { Notification } from '@/types'

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to BeetleX!',
    message: 'Registration is open. Form your team and start building.',
    type: 'announcement',
    priority: 'info',
    createdAt: '2026-05-01T08:00:00Z',
    read: true,
  },
  {
    id: 'notif-2',
    title: 'Submission deadline reminder',
    message: 'Final submissions are due soon. Make sure your project is ready.',
    type: 'deadline_alert',
    priority: 'warning',
    createdAt: '2026-06-14T12:00:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Judging has begun',
    message: 'Judges are now reviewing submissions. Results coming soon!',
    type: 'system',
    priority: 'info',
    createdAt: '2026-06-17T09:00:00Z',
    read: false,
  },
]

export const randomNotificationTemplates: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [
  {
    title: 'New team joined',
    message: 'A new team has registered for the hackathon.',
    type: 'announcement',
    priority: 'info',
  },
  {
    title: 'Submission received',
    message: 'A team just submitted their project for review.',
    type: 'announcement',
    priority: 'info',
  },
  {
    title: 'Schedule update',
    message: 'The judging timeline has been updated. Check the event page.',
    type: 'system',
    priority: 'warning',
  },
  {
    title: 'Mentor office hours',
    message: 'Office hours with industry mentors start in 30 minutes.',
    type: 'deadline_alert',
    priority: 'urgent',
  },
]
