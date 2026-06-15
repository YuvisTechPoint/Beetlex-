import type { LeaderboardEntry } from '@/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LeaderboardDeltaIndicator } from '../components/LeaderboardDeltaIndicator'

type ScoreBreakdown = {
  innovation: number
  technicalExecution: number
  impact: number
  presentation: number
}

type LeaderboardTableProps = {
  entries: LeaderboardEntry[]
  scoreBreakdowns: Map<string, ScoreBreakdown>
  trackName: (trackId: string) => string
}

export function LeaderboardTable({ entries, scoreBreakdowns, trackName }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Score Breakdown</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const breakdown = scoreBreakdowns.get(entry.teamId)
            return (
              <TableRow key={entry.teamId}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold tabular-nums hover:bg-primary/10"
                      >
                        {entry.rank}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="start">
                      <p className="mb-2 text-sm font-medium">Score Breakdown</p>
                      {breakdown ? (
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Innovation</dt>
                            <dd className="tabular-nums">{breakdown.innovation.toFixed(1)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Technical</dt>
                            <dd className="tabular-nums">
                              {breakdown.technicalExecution.toFixed(1)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Impact</dt>
                            <dd className="tabular-nums">{breakdown.impact.toFixed(1)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Presentation</dt>
                            <dd className="tabular-nums">{breakdown.presentation.toFixed(1)}</dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-muted-foreground">No breakdown available</p>
                      )}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="font-medium">{entry.teamName}</TableCell>
                <TableCell className="max-w-[140px] truncate">
                  {trackName(entry.trackId)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {breakdown ? (
                    <span className="text-xs tabular-nums">
                      {breakdown.innovation.toFixed(0)} / {breakdown.technicalExecution.toFixed(0)}{' '}
                      / {breakdown.impact.toFixed(0)} / {breakdown.presentation.toFixed(0)}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {entry.score.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  <LeaderboardDeltaIndicator delta={entry.delta} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
