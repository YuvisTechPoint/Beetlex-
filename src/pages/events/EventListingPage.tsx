import { memo, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CalendarOff,
  HelpCircle,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { useDebounce, useEvents, useMyRegistrations } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { calculatePrizePool } from '@/utils'
import type { Event } from '@/types'

const PAGE_SIZE = 6

interface EventFilterState {
  search: string
  status: Event['status'] | 'all'
  track: string
  dateFrom: string
  dateTo: string
}

const STATUS_OPTIONS: { value: Event['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_STYLES: Record<Event['status'], string> = {
  upcoming: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
}

function parseFilters(params: URLSearchParams): EventFilterState {
  const status = params.get('status')
  return {
    search: params.get('q') ?? '',
    status:
      status === 'upcoming' || status === 'active' || status === 'closed' ? status : 'all',
    track: params.get('track') ?? '',
    dateFrom: params.get('from') ?? '',
    dateTo: params.get('to') ?? '',
  }
}

function buildTrackOptions(events: Event[]) {
  const seen = new Map<string, string>()
  for (const event of events) {
    for (const track of event.tracks) {
      if (!seen.has(track.id)) seen.set(track.id, track.name)
    }
  }
  return Array.from(seen, ([id, name]) => ({ id, name }))
}

function recommendEvents(
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

function hasActiveFilters(filters: EventFilterState) {
  return (
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.track !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''
  )
}

function getAvatarInitials(index: number): string {
  const names = ['AC', 'SM', 'JR', 'MK', 'LP']
  return names[index % names.length]
}

function EventFilters({
  filters,
  onChange,
  tracks,
}: {
  filters: EventFilterState
  onChange: (filters: EventFilterState) => void
  tracks: { id: string; name: string }[]
}) {
  const update = (partial: Partial<EventFilterState>) => {
    onChange({ ...filters, ...partial })
  }

  const hasDateFilter = filters.dateFrom || filters.dateTo

  const clearFilters = () => {
    onChange({
      search: '',
      status: 'all',
      track: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const filtersActive =
    filters.search ||
    filters.status !== 'all' ||
    filters.track ||
    hasDateFilter

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm" role="search" aria-label="Filter events">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9"
          aria-label="Search events"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.status === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => update({ status: option.value })}
            aria-pressed={filters.status === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="track-filter">Track</Label>
          <Select
            value={filters.track || 'all'}
            onValueChange={(value) => update({ track: value === 'all' ? '' : value })}
          >
            <SelectTrigger id="track-filter" aria-label="Filter by track">
              <SelectValue placeholder="All tracks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {tracks.map((track) => (
                <SelectItem key={track.id} value={track.id}>
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">From</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            aria-label="Filter events from date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">To</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            aria-label="Filter events to date"
          />
        </div>
      </div>

      {filtersActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className={cn('gap-1 text-muted-foreground')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

const EventCard = memo(function EventCard({
  event,
  recommended,
}: {
  event: Event
  recommended?: boolean
}) {
  const prizePool = calculatePrizePool(event.prizes)
  const teamCount = Math.floor(event.participantCount / ((event.teamMinSize + event.teamMaxSize) / 2))

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
        recommended && 'ring-2 ring-primary/30',
      )}
    >
      {recommended && (
        <div className="border-b bg-primary/5 px-4 py-1.5 text-center text-xs font-medium text-primary">
          ✦ Recommended
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
          <Badge variant="outline" className={cn('shrink-0 capitalize', STATUS_STYLES[event.status])}>
            {event.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{event.tagline}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {event.tracks.slice(0, 3).map((track) => (
            <Badge key={track.id} variant="secondary" className="text-xs">
              {track.name}
            </Badge>
          ))}
          {event.tracks.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{event.tracks.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
            Reg closes {format(new Date(event.registrationClose), 'MMM d')} · Submit{' '}
            {format(new Date(event.submissionDeadline), 'MMM d')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            ${prizePool.toLocaleString()} prize pool
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[10px]">{getAvatarInitials(i)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {event.participantCount} participants · ~{teamCount} teams
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
        {event.status !== 'closed' && (
          <Button asChild className="flex-1">
            <Link to={`/events/${event.id}/register`}>Register</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})

function EventCardSkeleton() {
  return (
    <div className="rounded-xl border p-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}

function EventGrid({
  events,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasActiveFilters: filtersActive,
}: {
  events: Event[]
  isLoading?: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}) {
  if (isLoading) {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading events"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <CalendarOff className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-lg font-semibold">No events match your filters</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or search terms to find hackathons that match your interests.
        </p>
        {filtersActive && onClearFilters && (
          <Button className="mt-4" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Event listings"
      >
        {events.map((event) => (
          <div key={event.id} role="listitem">
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Event pagination"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-muted-foreground" aria-current="page">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}

function RecommendedSection({
  events,
  isLoading,
}: {
  events: Event[]
  isLoading?: boolean
}) {
  if (!isLoading && events.length === 0) return null

  return (
    <section className="mb-10" aria-labelledby="recommended-heading">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="recommended-heading" className="text-xl font-semibold">
          Recommended for you
        </h2>
        <span
          className="text-muted-foreground"
          title="Based on your profile and track preferences"
          aria-label="Based on your profile and track preferences"
        >
          <HelpCircle className="h-4 w-4" />
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2" aria-label="Loading recommendations">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2" role="list" aria-label="Recommended events">
          {events.map((event) => (
            <div key={event.id} role="listitem">
              <EventCard event={event} recommended />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function EventListingPage() {
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

  const tracks = useMemo(
    () => buildTrackOptions(allEventsData?.data ?? []),
    [allEventsData?.data],
  )

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

  return (
    <>
      <Header />
      <main id="main-content">
        <PageBackNav to="/" label="Back to Home" title="All Hackathons" />
        <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Hackathons</h1>
            <p className="mt-2 text-muted-foreground">
              {total} events on BeetleX — find your next challenge.
            </p>
          </div>
          {isOrganizer && (
            <Button asChild>
              <Link to="/organizer">Create Event</Link>
            </Button>
          )}
        </header>

        {isParticipant && recommended.length > 0 && (
          <RecommendedSection
            events={recommended}
            isLoading={registrationsLoading || !allEventsData}
          />
        )}

        <div className="sticky top-16 z-30 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <EventFilters filters={filters} onChange={handleFiltersChange} tracks={tracks} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Showing {showing} of {total} events
              {isFetching && !isLoading ? ' (updating…)' : ''}
            </span>
            {hasActiveFilters(filters) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {isError && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not load events</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>Check your connection and try again.</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8">
          <EventGrid
            events={data?.data ?? []}
            isLoading={isLoading}
            page={data?.pagination.page ?? page}
            totalPages={data?.pagination.totalPages ?? 1}
            onPageChange={(nextPage) => updateUrl(filters, nextPage)}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters(filters)}
          />
        </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
