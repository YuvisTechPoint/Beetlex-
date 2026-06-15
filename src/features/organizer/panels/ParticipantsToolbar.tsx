import { Search } from 'lucide-react'
import type { Event } from '@/types'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ParticipantsToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  trackFilter: string
  onTrackFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  pageSize: number | 'all'
  onPageSizeChange: (value: number | 'all') => void
  event: Event | undefined
}

export function ParticipantsToolbar({
  search,
  onSearchChange,
  trackFilter,
  onTrackFilterChange,
  statusFilter,
  onStatusFilterChange,
  pageSize,
  onPageSizeChange,
  event,
}: ParticipantsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={trackFilter} onValueChange={onTrackFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
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
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="registered">Registered</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(v === 'all' ? 'all' : Number(v))}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="25">25 / page</SelectItem>
          <SelectItem value="50">50 / page</SelectItem>
          <SelectItem value="100">100 / page</SelectItem>
          <SelectItem value="all">All (virtual)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
