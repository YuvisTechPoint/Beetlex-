import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, Send, Users } from 'lucide-react'
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed'
import { Leaderboard } from '@/components/shared/Leaderboard'
import { useAuth } from '@/hooks/useAuth'
import { useEvent } from '@/hooks/useEvent'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useMySubmission } from '@/hooks/useMySubmission'
import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'
import { useEventAnnouncements } from '@/hooks/useEventAnnouncements'
import { useCountdown } from '@/hooks/useCountdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusCard } from './StatusCard'
import { SubmissionStatusCard } from './SubmissionStatusCard'
import { OverviewResourcesPreview } from './OverviewResourcesPreview'

export function OverviewTab() {
  const { user } = useAuth()
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const eventId = team?.eventId
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: submission } = useMySubmission()
  const eventIdForLeaderboard = team?.eventId ?? 'evt-active-1'
  const {
    entries: leaderboardEntries,
    isLoading: leaderboardLoading,
    published,
  } = useLeaderboardStream({
    eventId: eventIdForLeaderboard,
    enabled: Boolean(team),
  })
  const leaderboard = useMemo(() => leaderboardEntries.slice(0, 10), [leaderboardEntries])
  const { data: announcements, isLoading: announcementsLoading } = useEventAnnouncements(eventId)
  const countdown = useCountdown(event?.submissionDeadline)

  const isLoading = teamLoading || eventLoading

  const teamFormed = team && team.members.length >= (event?.teamMinSize ?? 2)
  const submissionStatus = submission
    ? submission.isDraft
      ? 'draft'
      : 'submitted'
    : (team?.submissionStatus ?? 'not_started')

  const position =
    team?.leaderboardPosition ??
    (team ? leaderboard.find((e) => e.teamId === team.id)?.rank : undefined)
  const totalTeams = leaderboard?.length ?? 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  if (!team || !event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to BeetleX</CardTitle>
          <p className="text-sm text-muted-foreground">
            You are not registered for an active hackathon yet.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const timeLeftLabel = countdown.isExpired
    ? 'Deadline passed'
    : countdown.days > 0
      ? `${countdown.days}d ${countdown.hours}h left`
      : `${countdown.hours}h ${countdown.minutes}m left`

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          {event.title} ends in{' '}
          {countdown.isExpired ? (
            <span className="font-medium text-destructive">0 days (closed)</span>
          ) : (
            <span className="font-medium text-foreground">
              {countdown.days} day{countdown.days !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Team Status"
          value={teamFormed ? 'Formed' : 'Incomplete'}
          description={`${team.members.length} member${team.members.length !== 1 ? 's' : ''}`}
          icon={Users}
        />
        <StatusCard
          title="Submission Status"
          value={
            submissionStatus === 'submitted'
              ? 'Submitted'
              : submissionStatus === 'draft'
                ? 'Draft saved'
                : 'Not started'
          }
          icon={Send}
        />
        <StatusCard
          title="Your Position"
          value={position ? `#${position}` : '—'}
          description={totalTeams > 0 ? `of ${totalTeams} teams` : 'Leaderboard updating'}
          icon={Check}
        />
        <StatusCard
          title="Time Left"
          value={timeLeftLabel}
          description="Until submission deadline"
          icon={Clock}
        />
      </div>

      <SubmissionStatusCard submissionStatus={submissionStatus} teamFormed={Boolean(teamFormed)} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementFeed
              announcements={announcements ?? []}
              isLoading={announcementsLoading}
              limit={3}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/dashboard?tab=leaderboard">View Full Leaderboard</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {published === false ? (
              <p className="text-sm text-muted-foreground">
                Leaderboard results are hidden until organizers publish them.
              </p>
            ) : (
              <Leaderboard
                entries={leaderboard ?? []}
                currentTeamId={team.id}
                isLoading={leaderboardLoading}
                compact
              />
            )}
          </CardContent>
        </Card>
      </div>

      <OverviewResourcesPreview />
    </div>
  )
}
