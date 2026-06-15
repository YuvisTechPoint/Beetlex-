import { AlertCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react'

export type AlertBannerPriority = 'info' | 'warning' | 'urgent'

export interface AlertBannerStyle {
  icon: LucideIcon
  container: string
  iconClass: string
  title: string
  description: string
  dismiss: string
  action: string
}

export const ALERT_BANNER_STYLES: Record<AlertBannerPriority, AlertBannerStyle> = {
  info: {
    icon: Info,
    container:
      'border-blue-200/80 bg-blue-50/90 shadow-sm shadow-blue-500/5 dark:border-blue-500/25 dark:bg-blue-950/40',
    iconClass: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-950 dark:text-blue-50',
    description: 'text-blue-800/90 dark:text-blue-200/90',
    dismiss:
      'text-blue-700 hover:bg-blue-100/80 hover:text-blue-900 focus-visible:ring-blue-500/40 dark:text-blue-200 dark:hover:bg-blue-950/60',
    action: 'text-blue-800 hover:bg-blue-100/80 dark:text-blue-200 dark:hover:bg-blue-950/60',
  },
  warning: {
    icon: AlertTriangle,
    container:
      'border-amber-200/80 bg-amber-50/90 shadow-sm shadow-amber-500/5 dark:border-amber-500/25 dark:bg-amber-950/35',
    iconClass: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-950 dark:text-amber-50',
    description: 'text-amber-900/90 dark:text-amber-200/90',
    dismiss:
      'text-amber-800 hover:bg-amber-100/80 hover:text-amber-950 focus-visible:ring-amber-500/40 dark:text-amber-200 dark:hover:bg-amber-950/60',
    action: 'text-amber-900 hover:bg-amber-100/80 dark:text-amber-200 dark:hover:bg-amber-950/60',
  },
  urgent: {
    icon: AlertCircle,
    container:
      'border-red-200/80 bg-red-50/95 shadow-sm shadow-red-500/5 dark:border-red-500/30 dark:bg-red-950/35',
    iconClass: 'text-red-600 dark:text-red-400',
    title: 'text-red-950 dark:text-red-50',
    description: 'text-red-800/95 dark:text-red-200/90',
    dismiss:
      'text-red-700 hover:bg-red-100/80 hover:text-red-950 focus-visible:ring-red-500/40 dark:text-red-200 dark:hover:bg-red-950/50',
    action: 'text-red-800 hover:bg-red-100/80 dark:text-red-200 dark:hover:bg-red-950/50',
  },
}

export const ALERT_BANNER_LABELS: Record<AlertBannerPriority, string> = {
  info: 'Information',
  warning: 'Warning',
  urgent: 'Urgent',
}
