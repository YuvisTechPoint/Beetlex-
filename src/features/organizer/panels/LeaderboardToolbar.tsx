import { Download } from 'lucide-react'
import type { Event } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type LeaderboardToolbarProps = {
  published: boolean
  trackFilter: string
  onTrackFilterChange: (value: string) => void
  onExport: () => void
  onPublishToggle: () => void
  isPublishPending: boolean
  event: Event | undefined
}

export function LeaderboardToolbar({
  published,
  trackFilter,
  onTrackFilterChange,
  onExport,
  onPublishToggle,
  isPublishPending,
  event,
}: LeaderboardToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">Full rankings — auto-refreshes every 30 seconds</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'w-fit',
            published
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
          )}
        >
          {published ? 'Results are LIVE' : 'Results are HIDDEN from participants'}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={trackFilter} onValueChange={onTrackFilterChange}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by track" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tracks</SelectItem>
            {event?.tracks.map((track) => (
              <SelectItem key={track.id} value={track.id}>
                {track.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button
            variant={published ? 'outline' : 'default'}
            onClick={onPublishToggle}
            disabled={isPublishPending}
          >
            {published ? 'Unpublish Results' : 'Publish Results'}
          </Button>
        </div>
      </div>
    </>
  )
}
