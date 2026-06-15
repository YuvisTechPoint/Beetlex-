import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'
import { LeaderboardDelta } from './LeaderboardDelta'
import { formatTrackLabel, maxScore, teamInitials } from './leaderboardUtils'

interface LeaderboardListProps {
  entries: LeaderboardEntry[]
  currentTeamId?: string
  compact?: boolean
  startRank?: number
  showHeader?: boolean
}

const RANK_ACCENT: Record<number, string> = {
  1: 'border-l-2 border-l-primary',
  2: 'border-l-2 border-l-foreground/30',
  3: 'border-l-2 border-l-foreground/20',
}

const LeaderboardListRow = memo(function LeaderboardListRow({
  entry,
  currentTeamId,
  compact,
  scoreMax,
}: {
  entry: LeaderboardEntry
  currentTeamId?: string
  compact?: boolean
  scoreMax: number
}) {
  const isCurrentTeam = entry.teamId === currentTeamId
  const movedUp = entry.previousRank > entry.rank
  const movedDown = entry.previousRank < entry.rank
  const rankChanged = movedUp || movedDown
  const scorePct = Math.min(100, (entry.score / scoreMax) * 100)
  const isTopThree = entry.rank <= 3

  return (
    <li
      className={cn(
        'group relative border-b border-border/50 last:border-0',
        RANK_ACCENT[entry.rank],
        isCurrentTeam && 'bg-primary/[0.04]',
        rankChanged && movedUp && 'leaderboard-rank-up',
        rankChanged && movedDown && 'leaderboard-rank-down',
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-foreground/[0.03] transition-[width] duration-500"
        style={{ width: `${scorePct}%` }}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative grid items-center gap-3 px-3 interactive-row',
          compact
            ? 'grid-cols-[2.5rem_minmax(0,1fr)_4rem] py-2'
            : 'grid-cols-[3rem_minmax(0,1fr)_minmax(0,6rem)_4.5rem_3rem] py-2.5 sm:px-4',
        )}
      >
        <span
          className={cn(
            'font-mono-data text-center font-medium tabular-nums',
            isTopThree ? 'text-base text-foreground' : 'text-sm text-muted-foreground',
            movedUp && 'text-success',
            movedDown && 'text-destructive',
          )}
        >
          {String(entry.rank).padStart(2, '0')}
        </span>

        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-surface text-[10px] font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            {teamInitials(entry.teamName)}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn('truncate font-medium', compact ? 'text-sm' : 'text-[15px]')}>
                {entry.teamName}
              </span>
              {isCurrentTeam && (
                <span className="shrink-0 rounded border border-primary/25 bg-primary/8 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Your team
                </span>
              )}
            </div>
            {!compact && (
              <span className="text-meta truncate">{formatTrackLabel(entry.trackId)}</span>
            )}
          </div>
        </div>

        {!compact && (
          <span className="hidden truncate text-meta sm:block">
            {formatTrackLabel(entry.trackId)}
          </span>
        )}

        <span
          className={cn(
            'text-right font-mono-data font-semibold tabular-nums',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {entry.score.toFixed(1)}
        </span>

        {!compact && (
          <div className="hidden justify-end sm:flex">
            <LeaderboardDelta delta={entry.delta} />
          </div>
        )}
      </div>
    </li>
  )
})

export function LeaderboardList({
  entries,
  currentTeamId,
  compact,
  startRank = 1,
  showHeader = true,
}: LeaderboardListProps) {
  const listEntries = entries.filter((e) => e.rank >= startRank)
  if (listEntries.length === 0) return null

  const scoreMax = maxScore(entries)

  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-surface">
      {showHeader && !compact && (
        <div
          className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,6rem)_4.5rem_3rem] gap-3 border-b border-border/80 bg-muted/30 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground sm:px-4"
          aria-hidden="true"
        >
          <span>Rank</span>
          <span>Team</span>
          <span className="hidden sm:block">Track</span>
          <span className="text-right">Score</span>
          <span className="hidden text-right sm:block">Δ</span>
        </div>
      )}

      <ol className="divide-y divide-border/40" aria-label="Live standings">
        {listEntries.map((entry) => (
          <LeaderboardListRow
            key={entry.teamId}
            entry={entry}
            currentTeamId={currentTeamId}
            compact={compact}
            scoreMax={scoreMax}
          />
        ))}
      </ol>
    </div>
  )
}
