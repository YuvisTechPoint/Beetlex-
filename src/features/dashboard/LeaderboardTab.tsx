import { Leaderboard } from '@/components/shared/Leaderboard'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MODE_LABELS } from './utils'

export function LeaderboardTab() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const eventId = team?.eventId ?? 'evt-active-1'
  const { entries, isLoading, published, connectionMode, isError } = useLeaderboardStream({
    eventId,
    enabled: !teamLoading,
  })

  if (teamLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">Live rankings based on judge scores.</p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Could not load leaderboard</AlertTitle>
          <AlertDescription>
            Check your connection and refresh the page. If you just signed in, try again in a
            moment.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!published) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            Results will appear here once organizers publish them.
          </p>
        </div>
        <Alert>
          <AlertTitle>Results are hidden</AlertTitle>
          <AlertDescription>
            The leaderboard is not yet published. Check back after judging is complete.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            Live rankings based on judge scores. Streamed via SSE with polling fallback.
          </p>
        </div>
        <Badge variant={connectionMode === 'live' ? 'default' : 'secondary'} className="gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionMode === 'live'
                ? 'bg-emerald-500'
                : connectionMode === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-muted-foreground'
            }`}
            aria-hidden="true"
          />
          {MODE_LABELS[connectionMode]}
        </Badge>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card/50 p-4 sm:p-6">
        <Leaderboard entries={entries} currentTeamId={team?.id} />
      </div>
    </div>
  )
}
