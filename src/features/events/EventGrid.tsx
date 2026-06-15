import { CalendarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'
import { EventCard, EventCardSkeleton } from './EventCard'

interface EventGridProps {
  events: Event[]
  isLoading?: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export function EventGrid({
  events,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasActiveFilters: filtersActive,
}: EventGridProps) {
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
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Event pagination">
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
