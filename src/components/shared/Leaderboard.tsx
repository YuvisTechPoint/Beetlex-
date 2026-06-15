import { memo } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentTeamId?: string
  isLoading?: boolean
  compact?: boolean
  className?: string
}

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <ArrowUp className="h-3 w-3" aria-hidden="true" />
        {delta}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        <ArrowDown className="h-3 w-3" aria-hidden="true" />
        {Math.abs(delta)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">No change</span>
    </span>
  )
}

const RankCell = memo(function RankCell({
  rank,
  previousRank,
}: {
  rank: number
  previousRank: number
}) {
  const movedUp = previousRank > rank
  const movedDown = previousRank < rank
  const moved = movedUp || movedDown

  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-all duration-500',
        moved && 'bg-primary/10 text-primary leaderboard-rank-changed',
        movedUp && 'text-emerald-600 dark:text-emerald-400',
        movedDown && 'text-red-600 dark:text-red-400',
        !moved && 'bg-muted text-foreground',
      )}
    >
      {rank}
    </span>
  )
})

const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  currentTeamId,
  compact,
}: {
  entry: LeaderboardEntry
  currentTeamId?: string
  compact?: boolean
}) {
  const isCurrentTeam = entry.teamId === currentTeamId
  const movedUp = entry.previousRank > entry.rank
  const movedDown = entry.previousRank < entry.rank
  const rankChanged = movedUp || movedDown

  return (
    <TableRow
      className={cn(
        'transition-colors duration-300',
        isCurrentTeam && 'bg-primary/5 font-medium',
        rankChanged && movedUp && 'leaderboard-rank-up',
        rankChanged && movedDown && 'leaderboard-rank-down',
      )}
    >
      <TableCell>
        <RankCell rank={entry.rank} previousRank={entry.previousRank} />
      </TableCell>
      <TableCell className={cn(compact ? 'max-w-[120px] truncate' : '')}>
        {entry.teamName}
        {isCurrentTeam && <span className="ml-2 text-xs text-primary">(You)</span>}
      </TableCell>
      <TableCell className="text-right tabular-nums">{entry.score.toFixed(1)}</TableCell>
      <TableCell className="text-right">
        <DeltaIndicator delta={entry.delta} />
      </TableCell>
    </TableRow>
  )
})

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
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  const topTen = entries.slice(0, 10)

  if (topTen.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Leaderboard data is not available yet.
      </p>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="w-16 text-right">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topTen.map((entry) => (
            <LeaderboardRow
              key={entry.teamId}
              entry={entry}
              currentTeamId={currentTeamId}
              compact={compact}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
