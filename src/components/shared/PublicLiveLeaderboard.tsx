import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Leaderboard } from '@/components/shared/Leaderboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MODE_LABELS } from '@/features/dashboard/utils'
import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'
import { cn } from '@/lib/utils'

interface PublicLiveLeaderboardProps {
  eventId: string
  eventTitle?: string
  className?: string
  showDashboardLink?: boolean
}

function LiveStatusBadge({ mode }: { mode: keyof typeof MODE_LABELS }) {
  const isLive = mode === 'live'

  return (
    <Badge
      variant={isLive ? 'success' : 'secondary'}
      className="gap-1.5 font-mono text-[10px] uppercase tracking-wider"
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isLive ? 'bg-success live-indicator' : 'bg-muted-foreground',
        )}
        aria-hidden="true"
      />
      {MODE_LABELS[mode]}
    </Badge>
  )
}

function LeaderboardShell({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn('surface-panel overflow-hidden', className)}>
      {children}
    </section>
  )
}

export function PublicLiveLeaderboard({
  eventId,
  eventTitle,
  className,
  showDashboardLink = true,
}: PublicLiveLeaderboardProps) {
  const { entries, isLoading, published, connectionMode, isError } = useLeaderboardStream({
    eventId,
  })

  if (isLoading) {
    return (
      <LeaderboardShell className={className}>
        <div className="border-b border-border/60 px-5 py-4">
          <h2
            id="live-leaderboard-heading"
            className="text-section-title flex items-center gap-2"
          >
            <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Live standings
          </h2>
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="p-5">
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </LeaderboardShell>
    )
  }

  if (isError) {
    return (
      <LeaderboardShell className={className}>
        <div className="border-b border-border/60 px-5 py-4">
          <h2
            id="live-leaderboard-heading"
            className="text-section-title flex items-center gap-2"
          >
            <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Live standings
          </h2>
        </div>
        <div className="p-5">
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t load standings</AlertTitle>
            <AlertDescription>Refresh the page — the stream may have dropped.</AlertDescription>
          </Alert>
        </div>
      </LeaderboardShell>
    )
  }

  if (!published) {
    return (
      <LeaderboardShell className={className}>
        <div className="border-b border-border/60 px-5 py-4">
          <h2 id="live-leaderboard-heading" className="text-section-title">
            Live standings
          </h2>
          <p className="text-meta mt-1">
            {eventTitle
              ? `${eventTitle} — rankings publish when judging starts.`
              : 'Rankings publish when the organizer opens judging.'}
          </p>
        </div>
        <div className="p-5">
          <Alert>
            <AlertTitle>Not live yet</AlertTitle>
            <AlertDescription>
              Once published, scores update here in real time — no refresh needed.
            </AlertDescription>
          </Alert>
        </div>
      </LeaderboardShell>
    )
  }

  return (
    <LeaderboardShell className={className} id="live-leaderboard">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-label">Competition</p>
          <h2 id="live-leaderboard-heading" className="text-section-title mt-1">
            Live standings
          </h2>
          <p className="text-meta mt-1 max-w-md">
            {eventTitle ? `${eventTitle} · ` : ''}
            Top teams by judge score. Updates stream in as scores are submitted.
          </p>
        </div>
        <LiveStatusBadge mode={connectionMode} />
      </div>

      <div className="p-4 sm:p-5">
        <Leaderboard entries={entries} />

        {showDashboardLink && (
          <div className="mt-5 flex justify-end border-t border-border/60 pt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/events/${eventId}`}>Event details</Link>
            </Button>
          </div>
        )}
      </div>
    </LeaderboardShell>
  )
}
