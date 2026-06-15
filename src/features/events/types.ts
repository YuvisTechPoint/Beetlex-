import type { Event } from '@/types'

export interface EventFilterState {
  search: string
  status: Event['status'] | 'all'
  track: string
  dateFrom: string
  dateTo: string
}
