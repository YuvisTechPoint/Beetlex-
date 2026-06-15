import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import type { Event } from '@/types'
import { calculatePrizePool } from '@/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedCounter } from './AnimatedCounter'

interface HeroSectionProps {
  event?: Event
  isLoading?: boolean
}

function formatEventDateRange(event: Event) {
  const open = new Date(event.registrationOpen)
  const close = new Date(event.submissionDeadline)
  const sameYear = open.getFullYear() === close.getFullYear()
  if (sameYear) {
    return `${format(open, 'MMM d')}–${format(close, 'MMM d, yyyy')}`
  }
  return `${format(open, 'MMM d, yyyy')} – ${format(close, 'MMM d, yyyy')}`
}

function HeroStatsSkeleton() {
  return (
    <div
      className="mt-12 flex min-h-[5rem] flex-row flex-nowrap items-center justify-center gap-6 sm:gap-10 md:gap-16"
      aria-hidden="true"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="mx-auto h-9 w-16 sm:h-10 sm:w-20" />
          <Skeleton className="mx-auto mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function HeroSection({ event, isLoading }: HeroSectionProps) {
  const showStats = Boolean(event) && !isLoading
  const prizePool = event ? calculatePrizePool(event.prizes) : 0
  const participants = event?.participantCount ?? 0
  const trackCount = event?.tracks.length ?? 0
  const title = event?.title ?? 'BeetleX Global Hackathon'
  const dateLabel = event ? formatEventDateRange(event) : 'Registration open now'

  return (
    <section
      className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b bg-gradient-to-b from-indigo-50/80 via-background to-background dark:from-indigo-950/30"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div
        className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            {isLoading ? 'Loading dates…' : dateLabel}
          </Badge>

          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {isLoading ? (
              'BeetleX Hackathon'
            ) : (
              <>
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  {title.split(' ').slice(-1).join(' ')}
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {isLoading
              ? 'Loading...'
              : (event?.tagline ?? 'Build the future of developer tooling')}
          </p>

          {showStats ? (
            <div
              className="mt-12 flex min-h-[5rem] flex-row flex-nowrap items-center justify-center gap-6 sm:gap-10 md:gap-16"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                  <AnimatedCounter end={participants} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Participants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                  $<AnimatedCounter end={Math.round(prizePool / 1000)} suffix="K+" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Prize Pool</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                  <AnimatedCounter end={trackCount} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Tracks</p>
              </div>
            </div>
          ) : (
            <HeroStatsSkeleton />
          )}

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link to={event ? `/events/${event.id}/register` : '/events'}>
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
