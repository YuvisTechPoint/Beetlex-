import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useEvent } from '@/hooks/useEvent'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useOrganizerSubmissions } from '@/hooks/useOrganizerSubmissions'
import { DEFAULT_EVENT_ID } from '../constants'
import { downloadCsv } from '../utils'
import { LeaderboardPublishDialog } from './LeaderboardPublishDialog'
import { LeaderboardTable } from './LeaderboardTable'
import { LeaderboardToolbar } from './LeaderboardToolbar'

export default function LeaderboardPanel() {
  const {
    data: leaderboard,
    isLoading,
    statusQuery,
    publishMutation,
  } = useLeaderboard(DEFAULT_EVENT_ID, {
    forOrganizer: true,
    includeStatus: true,
    refetchInterval: 30_000,
  })
  const { data: submissions } = useOrganizerSubmissions()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const [trackFilter, setTrackFilter] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingPublish, setPendingPublish] = useState<boolean | null>(null)

  const published = statusQuery.data?.published ?? false

  const scoreBreakdowns = useMemo(() => {
    const map = new Map<
      string,
      { innovation: number; technicalExecution: number; impact: number; presentation: number }
    >()
    for (const sub of submissions ?? []) {
      if (sub.scoreBreakdown) {
        map.set(sub.teamId, sub.scoreBreakdown)
      }
    }
    return map
  }, [submissions])

  const filtered = useMemo(() => {
    let rows = leaderboard ?? []
    if (trackFilter !== 'all') {
      rows = rows.filter((e) => e.trackId === trackFilter)
    }
    return rows
  }, [leaderboard, trackFilter])

  const trackName = (trackId: string) =>
    event?.tracks.find((t) => t.id === trackId)?.name ?? trackId

  const handlePublishToggle = (next: boolean) => {
    setPendingPublish(next)
    setConfirmOpen(true)
  }

  const confirmPublish = async () => {
    if (pendingPublish == null) return
    try {
      await publishMutation.mutateAsync(pendingPublish)
      toast.success(
        pendingPublish
          ? 'Results are now live for participants'
          : 'Results hidden from participants',
      )
    } catch {
      toast.error('Failed to update publish status')
    } finally {
      setConfirmOpen(false)
      setPendingPublish(null)
    }
  }

  const exportCsv = () => {
    downloadCsv(
      'leaderboard-export.csv',
      ['Rank', 'Team', 'Track', 'Score', 'Delta'],
      filtered.map((e) => [
        String(e.rank),
        e.teamName,
        trackName(e.trackId),
        e.score.toFixed(1),
        String(e.delta),
      ]),
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LeaderboardToolbar
        published={published}
        trackFilter={trackFilter}
        onTrackFilterChange={setTrackFilter}
        onExport={exportCsv}
        onPublishToggle={() => handlePublishToggle(!published)}
        isPublishPending={publishMutation.isPending}
        event={event}
      />

      <LeaderboardTable
        entries={filtered}
        scoreBreakdowns={scoreBreakdowns}
        trackName={trackName}
      />

      <LeaderboardPublishDialog
        open={confirmOpen}
        pendingPublish={pendingPublish}
        isPending={publishMutation.isPending}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmPublish}
      />
    </div>
  )
}
