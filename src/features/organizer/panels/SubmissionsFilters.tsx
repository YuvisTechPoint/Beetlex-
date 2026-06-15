import type { Event } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SubmissionsFiltersProps = {
  trackFilter: string
  onTrackFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  event: Event | undefined
}

export function SubmissionsFilters({
  trackFilter,
  onTrackFilterChange,
  statusFilter,
  onStatusFilterChange,
  event,
}: SubmissionsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select value={trackFilter} onValueChange={onTrackFilterChange}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Track" />
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
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="scored">Scored</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
