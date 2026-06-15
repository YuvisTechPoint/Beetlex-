import type { Event } from '@/types'

export const STATUS_LABELS: Record<Event['status'], string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
}

export const STATUS_VARIANTS: Record<Event['status'], 'default' | 'secondary' | 'outline'> = {
  upcoming: 'secondary',
  active: 'default',
  closed: 'outline',
}
