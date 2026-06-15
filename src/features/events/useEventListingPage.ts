import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce, useEvents, useMyRegistrations } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import type { Event } from '@/types'
import { PAGE_SIZE } from './constants'
import type { EventFilterState } from '@/types'
import { buildTrackOptions, hasActiveFilters, parseFilters, recommendEvents } from './utils'

export interface EventListingPageState {
  filters: EventFilterState
  page: number
  isParticipant: boolean
  isOrganizer: boolean
  isAuthenticated: boolean
  tracks: { id: string; name: string }[]
  recommended: Event[]
  recommendedLoading: boolean
  showRecommended: boolean
  total: number
  showing: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  events: Event[]
  paginationPage: number
  totalPages: number
  handleFiltersChange: (next: EventFilterState) => void
  clearFilters: () => void
  onPageChange: (nextPage: number) => void
  refetch: () => void
  filtersActive: boolean
}

export function useEventListingPage(): EventListingPageState {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const page = useMemo(
    () => Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
    [searchParams],
  )

  const debouncedSearch = useDebounce(filters.search, 300)
  const { isAuthenticated, user } = useAuth()
  const isParticipant = isAuthenticated && user?.role === 'participant'
  const isOrganizer = isAuthenticated && user?.role === 'organizer'

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      track: filters.track || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, filters.status, filters.track, filters.dateFrom, filters.dateTo, page],
  )

  const { data, isLoading, isError, refetch, isFetching } = useEvents(queryFilters)
  const { data: allEventsData } = useEvents({ limit: 50 })
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations()

  const updateUrl = useCallback(
    (nextFilters: EventFilterState, nextPage: number) => {
      const params = new URLSearchParams()
      if (nextFilters.search) params.set('q', nextFilters.search)
      if (nextFilters.status !== 'all') params.set('status', nextFilters.status)
      if (nextFilters.track) params.set('track', nextFilters.track)
      if (nextFilters.dateFrom) params.set('from', nextFilters.dateFrom)
      if (nextFilters.dateTo) params.set('to', nextFilters.dateTo)
      if (nextPage > 1) params.set('page', String(nextPage))
      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  const tracks = useMemo(() => buildTrackOptions(allEventsData?.data ?? []), [allEventsData?.data])

  const registeredEventIds = useMemo(
    () => new Set(registrations?.map((r) => r.eventId) ?? []),
    [registrations],
  )

  const registeredTrackIds = useMemo(() => {
    const ids = new Set<string>()
    const events = allEventsData?.data ?? []
    for (const reg of registrations ?? []) {
      const event = events.find((e) => e.id === reg.eventId)
      event?.tracks.forEach((t) => ids.add(t.id))
    }
    return ids
  }, [registrations, allEventsData?.data])

  const recommended = useMemo(
    () =>
      isParticipant
        ? recommendEvents(allEventsData?.data ?? [], registeredEventIds, registeredTrackIds)
        : [],
    [isParticipant, allEventsData?.data, registeredEventIds, registeredTrackIds],
  )

  const handleFiltersChange = (next: EventFilterState) => {
    updateUrl(next, 1)
  }

  const clearFilters = () => {
    updateUrl({ search: '', status: 'all', track: '', dateFrom: '', dateTo: '' }, 1)
  }

  const total = data?.pagination.total ?? 0
  const showing = data?.data.length ?? 0

  return {
    filters,
    page,
    isParticipant,
    isOrganizer,
    isAuthenticated,
    tracks,
    recommended,
    recommendedLoading: registrationsLoading || !allEventsData,
    showRecommended: isParticipant && recommended.length > 0,
    total,
    showing,
    isLoading,
    isError,
    isFetching,
    events: data?.data ?? [],
    paginationPage: data?.pagination.page ?? page,
    totalPages: data?.pagination.totalPages ?? 1,
    handleFiltersChange,
    clearFilters,
    onPageChange: (nextPage) => updateUrl(filters, nextPage),
    refetch: () => void refetch(),
    filtersActive: hasActiveFilters(filters),
  }
}
