import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Leaderboard } from '@/components/shared/Leaderboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MODE_LABELS } from '@/features/dashboard/utils'
import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'

interface PublicLiveLeaderboardProps {
  eventId: string
  eventTitle?: string
  className?: string
  showDashboardLink?: boolean
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
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Could not load leaderboard</AlertTitle>
            <AlertDescription>Please refresh the page to try again.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!published) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            Live Leaderboard
          </CardTitle>
          <CardDescription>
            {eventTitle
              ? `Results for ${eventTitle} will appear here once judging begins.`
              : 'Results will appear here once organizers publish them.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Results not published yet</AlertTitle>
            <AlertDescription>
              Check back during judging — rankings update in real time once published.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className} id="live-leaderboard">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            Live Leaderboard
          </CardTitle>
          <CardDescription>
            Real-time rankings{eventTitle ? ` for ${eventTitle}` : ''} — no refresh required.
          </CardDescription>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <Leaderboard entries={entries} compact />
        {showDashboardLink && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/events/${eventId}#live-leaderboard`}>View full standings</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
