import { lazy, Suspense, useMemo } from 'react'
import { ClipboardList, Gavel, TrendingUp, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useOrganizerActivity } from '@/hooks/useOrganizerActivity'
import { useOrganizerJudges } from '@/hooks/useOrganizerJudges'
import { useOrganizerStats } from '@/hooks/useOrganizerStats'
import { useOrganizerSubmissions } from '@/hooks/useOrganizerSubmissions'
import { useParticipants } from '@/hooks/useParticipants'
import { OverviewStatCard } from '../components/OverviewStatCard'
import { DEFAULT_EVENT_ID } from '../types'
import { OverviewActivityFeed } from './OverviewActivityFeed'

const OverviewCharts = lazy(() => import('./OverviewCharts'))

export default function OverviewPanel() {
  const { data: stats, isLoading: statsLoading } = useOrganizerStats()
  const { data: participantsPage } = useParticipants({ pageSize: 5000 })
  const participants = participantsPage?.data
  const { data: submissions } = useOrganizerSubmissions()
  const { data: judges } = useOrganizerJudges()
  const { data: activity, isLoading: activityLoading } = useOrganizerActivity(10_000)
  const { data: leaderboard } = useLeaderboard(DEFAULT_EVENT_ID, { forOrganizer: true })

  const registrationsLastHour = useMemo(() => {
    if (!participants) return 0
    const cutoff = Date.now() - 60 * 60 * 1000
    return participants.filter((p) => new Date(p.registeredAt).getTime() >= cutoff).length
  }, [participants])

  const registrationChartData = useMemo(() => {
    if (!participants) return []
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setMinutes(0, 0, 0)
      hour.setHours(hour.getHours() - (23 - i))
      return {
        hour: hour.toLocaleTimeString(undefined, { hour: 'numeric' }),
        count: 0,
        timestamp: hour.getTime(),
      }
    })

    for (const participant of participants) {
      const registeredAt = new Date(participant.registeredAt).getTime()
      const bucket = buckets.find((b, i) => {
        const next = buckets[i + 1]?.timestamp ?? Date.now() + 3_600_000
        return registeredAt >= b.timestamp && registeredAt < next
      })
      if (bucket) bucket.count += 1
    }

    return buckets
  }, [participants])

  const submissionsByTrack = useMemo(() => {
    if (stats?.tracksBreakdown) {
      return stats.tracksBreakdown.map((track) => ({
        name: track.trackName.split(' ').slice(0, 2).join(' '),
        submissions: submissions?.filter((s) => s.trackId === track.trackId && !s.isDraft).length ?? 0,
        teams: track.teamCount,
      }))
    }
    return []
  }, [stats, submissions])

  const scoreDistribution = useMemo(() => {
    const bins = Array.from({ length: 8 }, (_, i) => ({
      range: `${i * 5 + 1}-${(i + 1) * 5}`,
      count: 0,
      min: i * 5 + 1,
      max: (i + 1) * 5,
    }))

    for (const entry of leaderboard ?? []) {
      const bucket = bins.find((b) => entry.score >= b.min && entry.score <= b.max)
      if (bucket) bucket.count += 1
    }

    return bins
  }, [leaderboard])

  const activeJudges = judges?.filter((j) => j.reviewedCount > 0).length ?? 0
  const totalJudges = judges?.length ?? 0
  const teamPct = stats
    ? Math.round((stats.totalTeams / Math.max(stats.totalParticipants, 1)) * 100)
    : 0

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Live command center for your hackathon</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard
          title="Total Registrations"
          value={String(stats?.totalParticipants ?? 0)}
          subtitle={`+${registrationsLastHour} in last hour`}
          icon={Users}
        />
        <OverviewStatCard
          title="Teams Formed"
          value={String(stats?.totalTeams ?? 0)}
          subtitle={`${teamPct}% of registrations`}
          icon={TrendingUp}
        />
        <OverviewStatCard
          title="Submissions Received"
          value={`${stats?.submissionsReceived ?? 0} / ${stats?.totalTeams ?? 0}`}
          subtitle={`${stats?.submissionsPending ?? 0} pending review`}
          icon={ClipboardList}
        />
        <OverviewStatCard
          title="Active Judges"
          value={`${activeJudges} / ${totalJudges}`}
          subtitle={`${stats?.judgingProgress ?? 0}% judging complete`}
          icon={Gavel}
        />
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        }
      >
        <OverviewCharts
          registrationChartData={registrationChartData}
          submissionsByTrack={submissionsByTrack}
          scoreDistribution={scoreDistribution}
        />
      </Suspense>

      <OverviewActivityFeed activity={activity} isLoading={activityLoading} />
    </div>
  )
}
