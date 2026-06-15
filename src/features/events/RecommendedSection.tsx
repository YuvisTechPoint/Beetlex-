import { HelpCircle, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Event } from '@/types'
import { EventCard } from './EventCard'

interface RecommendedSectionProps {
  events: Event[]
  isLoading?: boolean
}

export function RecommendedSection({ events, isLoading }: RecommendedSectionProps) {
  if (!isLoading && events.length === 0) return null

  return (
    <section className="mb-10" aria-labelledby="recommended-heading">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="recommended-heading" className="text-xl font-semibold">
            Recommended for you
          </h2>
          <span
            className="text-muted-foreground"
            title="Heuristic scoring: track overlap, event status, and registration dates"
            aria-label="Heuristic scoring: track overlap, event status, and registration dates"
          >
            <HelpCircle className="h-4 w-4" />
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ranked by track match, active status, and open registration — explained in-app, no external AI API.
        </p>
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
