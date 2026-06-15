import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { LeaderboardList } from './LeaderboardList'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentTeamId?: string
  isLoading?: boolean
  compact?: boolean
  className?: string
}

export function Leaderboard({
  entries,
  currentTeamId,
  isLoading,
  compact,
  className,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-9 w-full rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const topTen = entries.slice(0, 10)

  if (topTen.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 px-6 py-12 text-center">
        <p className="text-sm font-medium">Standings not published yet</p>
        <p className="text-meta mt-1">
          Rankings appear once judging begins and the organizer publishes results.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <LeaderboardList
        entries={topTen}
        currentTeamId={currentTeamId}
        compact={compact}
        startRank={1}
        showHeader={!compact}
      />
    </div>
  )
}
