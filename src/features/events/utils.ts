import type { Event } from '@/types'
import type { EventFilterState } from '@/types'

export function parseFilters(params: URLSearchParams): EventFilterState {
  const status = params.get('status')
  return {
    search: params.get('q') ?? '',
    status: status === 'upcoming' || status === 'active' || status === 'closed' ? status : 'all',
    track: params.get('track') ?? '',
    dateFrom: params.get('from') ?? '',
    dateTo: params.get('to') ?? '',
  }
}

export function buildTrackOptions(events: Event[]) {
  const seen = new Map<string, string>()
  for (const event of events) {
    for (const track of event.tracks) {
      if (!seen.has(track.id)) seen.set(track.id, track.name)
    }
  }
  return Array.from(seen, ([id, name]) => ({ id, name }))
}

export function recommendEvents(
  allEvents: Event[],
  registeredEventIds: Set<string>,
  registeredTrackIds: Set<string>,
): Event[] {
  return allEvents
    .filter((e) => e.status !== 'closed' && !registeredEventIds.has(e.id))
    .sort((a, b) => {
      const aMatch = a.tracks.some((t) => registeredTrackIds.has(t.id)) ? 1 : 0
      const bMatch = b.tracks.some((t) => registeredTrackIds.has(t.id)) ? 1 : 0
      if (aMatch !== bMatch) return bMatch - aMatch
      if (a.status === 'active' && b.status !== 'active') return -1
      if (b.status === 'active' && a.status !== 'active') return 1
      return new Date(a.registrationOpen).getTime() - new Date(b.registrationOpen).getTime()
    })
    .slice(0, 2)
}

export function hasActiveFilters(filters: EventFilterState) {
  return (
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.track !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''
  )
}

export function getAvatarInitials(index: number): string {
  const names = ['AC', 'SM', 'JR', 'MK', 'LP']
  return names[index % names.length]
}
