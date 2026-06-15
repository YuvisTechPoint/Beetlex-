import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from './constants'
import type { EventFilterState } from '@/types'

interface EventFiltersProps {
  filters: EventFilterState
  onChange: (filters: EventFilterState) => void
  tracks: { id: string; name: string }[]
}

export function EventFilters({ filters, onChange, tracks }: EventFiltersProps) {
  const update = (partial: Partial<EventFilterState>) => {
    onChange({ ...filters, ...partial })
  }

  const hasDateFilter = filters.dateFrom || filters.dateTo

  const clearFilters = () => {
    onChange({
      search: '',
      status: 'all',
      track: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const filtersActive = filters.search || filters.status !== 'all' || filters.track || hasDateFilter

  return (
    <div
      className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
      role="search"
      aria-label="Filter events"
    >
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9"
          aria-label="Search events"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.status === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => update({ status: option.value })}
            aria-pressed={filters.status === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="track-filter">Track</Label>
          <Select
            value={filters.track || 'all'}
            onValueChange={(value) => update({ track: value === 'all' ? '' : value })}
          >
            <SelectTrigger id="track-filter" aria-label="Filter by track">
              <SelectValue placeholder="All tracks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {tracks.map((track) => (
                <SelectItem key={track.id} value={track.id}>
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">From</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            aria-label="Filter events from date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">To</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            aria-label="Filter events to date"
          />
        </div>
      </div>

      {filtersActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className={cn('gap-1 text-muted-foreground')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
