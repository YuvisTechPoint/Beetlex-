import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Clock,
  Info,
  Trophy,
} from 'lucide-react'
import type { Notification } from '@/types'

export const NAV_LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/#about', label: 'About' },
  { to: '/#faq', label: 'FAQ' },
  { to: '/#contact', label: 'Contact' },
] as const

export const PRIORITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  urgent: AlertOctagon,
} as const

export const PRIORITY_STYLES = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
} as const

export const TYPE_ICONS = {
  announcement: Info,
  score_update: Trophy,
  deadline_alert: Clock,
  system: Bell,
} as const

export function notificationIcon(notification: Notification) {
  if (notification.type in TYPE_ICONS) {
    return TYPE_ICONS[notification.type as keyof typeof TYPE_ICONS]
  }
  return PRIORITY_ICONS[notification.priority]
}
