import type { Event } from '@/types'

export const PAGE_SIZE = 6

export const STATUS_OPTIONS: { value: Event['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
]

export const STATUS_STYLES: Record<Event['status'], string> = {
  upcoming: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
}
