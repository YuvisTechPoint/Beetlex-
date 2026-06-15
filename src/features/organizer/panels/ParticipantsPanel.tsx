import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import type { OrganizerParticipant } from '@/api/organizer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StaleDataIndicator } from '@/components/shared/StaleDataIndicator'
import { useDebounce } from '@/hooks/useDebounce'
import { useEvent } from '@/hooks/useEvent'
import { useParticipants } from '@/hooks/useParticipants'
import { useVirtualRows } from '@/hooks/useVirtualRows'
import { formatDateTime } from '@/utils'
import { DEFAULT_EVENT_ID } from '../types'
import { downloadCsv } from '../utils'
import { ParticipantDetailSheet } from './ParticipantDetailSheet'
import { ParticipantsTable } from './ParticipantsTable'
import { ParticipantsToolbar } from './ParticipantsToolbar'
import {
  VIRTUAL_ROW_HEIGHT,
  VIRTUAL_VIEWPORT_HEIGHT,
  type ParticipantSortDir,
  type ParticipantSortKey,
} from './participantsConstants'

export default function ParticipantsPanel() {
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<ParticipantSortKey>('registeredAt')
  const [sortDir, setSortDir] = useState<ParticipantSortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | 'all'>(25)
  const [scrollTop, setScrollTop] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<OrganizerParticipant | null>(null)

  const debouncedSearch = useDebounce(search)
  const useVirtual = pageSize === 'all'

  const queryParams = useMemo(
    () => ({
      page: useVirtual ? 1 : page,
      pageSize: useVirtual ? 5000 : pageSize,
      q: debouncedSearch || undefined,
      trackId: trackFilter !== 'all' ? trackFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sort: sortKey === 'index' ? 'name' : sortKey,
      sortDir,
    }),
    [debouncedSearch, page, pageSize, sortDir, sortKey, statusFilter, trackFilter, useVirtual],
  )

  const { data: participantsPage, isLoading, isFetching, isStale, refetch } =
    useParticipants(queryParams)
  const { data: event } = useEvent(DEFAULT_EVENT_ID)

  const pageRows = participantsPage?.data ?? []
  const totalFiltered = participantsPage?.total ?? 0
  const totalPages = participantsPage?.totalPages ?? 1

  const virtualWindow = useVirtualRows(
    pageRows.length,
    scrollTop,
    VIRTUAL_VIEWPORT_HEIGHT,
    VIRTUAL_ROW_HEIGHT,
  )
  const visibleRows = useVirtual
    ? pageRows.slice(virtualWindow.start, virtualWindow.end)
    : pageRows

  const toggleSort = (key: ParticipantSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleRow = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const toggleAllPage = () => {
    const pageIds = pageRows.map((p) => p.userId)
    const allSelected = pageIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of pageIds) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  const exportSelected = () => {
    const rows = pageRows.filter((p) => selected.has(p.userId))
    if (rows.length === 0) return
    downloadCsv(
      'participants-export.csv',
      ['Name', 'Email', 'College', 'Track', 'Team', 'Status', 'Registered At'],
      rows.map((p) => [
        p.name,
        p.email,
        p.college ?? '',
        p.trackName,
        p.teamName,
        p.status,
        formatDateTime(p.registeredAt),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
          <p className="text-muted-foreground">
            {totalFiltered} registration{totalFiltered !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" disabled={selected.size === 0} onClick={exportSelected}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export Selected ({selected.size})
        </Button>
      </div>

      <StaleDataIndicator
        isStale={isStale}
        isFetching={isFetching}
        onRefresh={() => void refetch()}
      />

      <ParticipantsToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        trackFilter={trackFilter}
        onTrackFilterChange={(value) => {
          setTrackFilter(value)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
          setScrollTop(0)
        }}
        event={event}
      />

      <ParticipantsTable
        pageRows={pageRows}
        visibleRows={visibleRows}
        selected={selected}
        sortKey={sortKey}
        sortDir={sortDir}
        useVirtual={useVirtual}
        virtualWindow={virtualWindow}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        scrollTop={scrollTop}
        onScrollTopChange={setScrollTop}
        onToggleSort={toggleSort}
        onToggleRow={toggleRow}
        onToggleAllPage={toggleAllPage}
        onSelectParticipant={setDetail}
        onPageChange={setPage}
      />

      <ParticipantDetailSheet participant={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
