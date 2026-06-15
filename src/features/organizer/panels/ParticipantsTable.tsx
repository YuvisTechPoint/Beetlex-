import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { OrganizerParticipant } from '@/api/organizer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils'
import {
  PARTICIPANT_STATUS_STYLES,
  VIRTUAL_VIEWPORT_HEIGHT,
  type ParticipantSortDir,
  type ParticipantSortKey,
} from './participantsConstants'

type VirtualWindow = {
  start: number
  end: number
  paddingTop: number
  paddingBottom: number
}

type ParticipantsTableProps = {
  pageRows: OrganizerParticipant[]
  visibleRows: OrganizerParticipant[]
  selected: Set<string>
  sortKey: ParticipantSortKey
  sortDir: ParticipantSortDir
  useVirtual: boolean
  virtualWindow: VirtualWindow
  page: number
  pageSize: number | 'all'
  totalPages: number
  scrollTop: number
  onScrollTopChange: (scrollTop: number) => void
  onToggleSort: (key: ParticipantSortKey) => void
  onToggleRow: (userId: string) => void
  onToggleAllPage: () => void
  onSelectParticipant: (participant: OrganizerParticipant) => void
  onPageChange: (page: number) => void
}

export function ParticipantsTable({
  pageRows,
  visibleRows,
  selected,
  sortKey,
  sortDir,
  useVirtual,
  virtualWindow,
  page,
  pageSize,
  totalPages,
  onScrollTopChange,
  onToggleSort,
  onToggleRow,
  onToggleAllPage,
  onSelectParticipant,
  onPageChange,
}: ParticipantsTableProps) {
  const renderParticipantRow = (participant: OrganizerParticipant, globalIndex: number) => (
    <TableRow
      key={participant.userId}
      className="cursor-pointer"
      onClick={() => onSelectParticipant(participant)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected.has(participant.userId)}
          onCheckedChange={() => onToggleRow(participant.userId)}
          aria-label={`Select ${participant.name}`}
        />
      </TableCell>
      <TableCell className="text-muted-foreground">{globalIndex + 1}</TableCell>
      <TableCell className="font-medium">{participant.name}</TableCell>
      <TableCell>{participant.email}</TableCell>
      <TableCell>{participant.college ?? '—'}</TableCell>
      <TableCell className="max-w-[140px] truncate">{participant.trackName}</TableCell>
      <TableCell>{participant.teamName}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn(PARTICIPANT_STATUS_STYLES[participant.status])}>
          {participant.status}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDateTime(participant.registeredAt)}
      </TableCell>
    </TableRow>
  )

  return (
    <>
      <div
        className={cn('overflow-hidden rounded-lg border', useVirtual && 'overflow-auto')}
        style={useVirtual ? { maxHeight: VIRTUAL_VIEWPORT_HEIGHT } : undefined}
        onScroll={useVirtual ? (e) => onScrollTopChange(e.currentTarget.scrollTop) : undefined}
      >
        <Table>
          <TableHeader className={useVirtual ? 'sticky top-0 z-10 bg-background' : undefined}>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pageRows.length > 0 && pageRows.every((p) => selected.has(p.userId))}
                  onCheckedChange={onToggleAllPage}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="w-10 cursor-pointer" onClick={() => onToggleSort('index')}>
                #
              </TableHead>
              {(
                [
                  ['name', 'Name'],
                  ['email', 'Email'],
                  ['college', 'College/Org'],
                  ['trackName', 'Track'],
                  ['teamName', 'Team'],
                  ['status', 'Status'],
                  ['registeredAt', 'Registered At'],
                ] as const
              ).map(([key, label]) => (
                <TableHead
                  key={key}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => onToggleSort(key)}
                >
                  {label}
                  {sortKey === key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {useVirtual && virtualWindow.paddingTop > 0 && (
              <TableRow aria-hidden="true" style={{ height: virtualWindow.paddingTop }}>
                <TableCell colSpan={9} className="border-0 p-0" />
              </TableRow>
            )}
            {visibleRows.map((participant, idx) =>
              renderParticipantRow(
                participant,
                useVirtual
                  ? virtualWindow.start + idx
                  : (page - 1) * (typeof pageSize === 'number' ? pageSize : 25) + idx,
              ),
            )}
            {useVirtual && virtualWindow.paddingBottom > 0 && (
              <TableRow aria-hidden="true" style={{ height: virtualWindow.paddingBottom }}>
                <TableCell colSpan={9} className="border-0 p-0" />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!useVirtual && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
