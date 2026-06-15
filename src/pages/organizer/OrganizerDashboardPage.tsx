import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  Gavel,
  LayoutDashboard,
  Megaphone,
  Minus,
  Search,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import type { OrganizerParticipant, OrganizerSubmissionSummary } from '@/api/organizer'
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAssignJudge, useAssignSubmissionJudge } from '@/hooks/useAssignJudge'
import { useBroadcastAnnouncement } from '@/hooks/useBroadcastAnnouncement'
import { useDebounce } from '@/hooks/useDebounce'
import { useEvent } from '@/hooks/useEvent'
import { useEventAnnouncements } from '@/hooks/useEventAnnouncements'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useOrganizerActivity } from '@/hooks/useOrganizerActivity'
import { useOrganizerJudges } from '@/hooks/useOrganizerJudges'
import { useOrganizerStats } from '@/hooks/useOrganizerStats'
import { useOrganizerSubmissions } from '@/hooks/useOrganizerSubmissions'
import { useParticipants } from '@/hooks/useParticipants'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'
import { formatDateTime } from '@/utils'

const DEFAULT_EVENT_ID = 'evt-active-1'

type OrganizerTab =
  | 'overview'
  | 'participants'
  | 'submissions'
  | 'judges'
  | 'announcements'
  | 'leaderboard'

const TABS: {
  id: OrganizerTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: ClipboardList },
  { id: 'judges', label: 'Judges', icon: Gavel },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
]

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function parseTab(value: string | null): OrganizerTab {
  if (value && TABS.some((t) => t.id === value)) {
    return value as OrganizerTab
  }
  return 'overview'
}

function OverviewStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

const OVERVIEW_ACTIVITY_ICONS = {
  registration: Users,
  submission: ClipboardList,
  score: Gavel,
  announcement: Activity,
} as const

function OverviewPanel() {
  const { data: stats, isLoading: statsLoading } = useOrganizerStats()
  const { data: participants } = useParticipants()
  const { data: submissions } = useOrganizerSubmissions()
  const { data: judges } = useOrganizerJudges()
  const { data: activity, isLoading: activityLoading } = useOrganizerActivity(10_000)
  const { data: leaderboard } = useLeaderboard(DEFAULT_EVENT_ID, { forOrganizer: true })

  const registrationsLastHour = useMemo(() => {
    if (!participants) return 0
    const cutoff = Date.now() - 60 * 60 * 1000
    return participants.filter((p) => new Date(p.registeredAt).getTime() >= cutoff).length
  }, [participants])

  const registrationChartData = useMemo(() => {
    if (!participants) return []
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setMinutes(0, 0, 0)
      hour.setHours(hour.getHours() - (23 - i))
      return {
        hour: hour.toLocaleTimeString(undefined, { hour: 'numeric' }),
        count: 0,
        timestamp: hour.getTime(),
      }
    })

    for (const participant of participants) {
      const registeredAt = new Date(participant.registeredAt).getTime()
      const bucket = buckets.find((b, i) => {
        const next = buckets[i + 1]?.timestamp ?? Date.now() + 3_600_000
        return registeredAt >= b.timestamp && registeredAt < next
      })
      if (bucket) bucket.count += 1
    }

    return buckets
  }, [participants])

  const submissionsByTrack = useMemo(() => {
    if (stats?.tracksBreakdown) {
      return stats.tracksBreakdown.map((track) => ({
        name: track.trackName.split(' ').slice(0, 2).join(' '),
        submissions: submissions?.filter((s) => s.trackId === track.trackId && !s.isDraft).length ?? 0,
        teams: track.teamCount,
      }))
    }
    return []
  }, [stats, submissions])

  const scoreDistribution = useMemo(() => {
    const bins = Array.from({ length: 8 }, (_, i) => ({
      range: `${i * 5 + 1}-${(i + 1) * 5}`,
      count: 0,
      min: i * 5 + 1,
      max: (i + 1) * 5,
    }))

    for (const entry of leaderboard ?? []) {
      const bucket = bins.find((b) => entry.score >= b.min && entry.score <= b.max)
      if (bucket) bucket.count += 1
    }

    return bins
  }, [leaderboard])

  const activeJudges = judges?.filter((j) => j.reviewedCount > 0).length ?? 0
  const totalJudges = judges?.length ?? 0
  const teamPct = stats
    ? Math.round((stats.totalTeams / Math.max(stats.totalParticipants, 1)) * 100)
    : 0

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Live command center for your hackathon</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard
          title="Total Registrations"
          value={String(stats?.totalParticipants ?? 0)}
          subtitle={`+${registrationsLastHour} in last hour`}
          icon={Users}
        />
        <OverviewStatCard
          title="Teams Formed"
          value={String(stats?.totalTeams ?? 0)}
          subtitle={`${teamPct}% of registrations`}
          icon={TrendingUp}
        />
        <OverviewStatCard
          title="Submissions Received"
          value={`${stats?.submissionsReceived ?? 0} / ${stats?.totalTeams ?? 0}`}
          subtitle={`${stats?.submissionsPending ?? 0} pending review`}
          icon={ClipboardList}
        />
        <OverviewStatCard
          title="Active Judges"
          value={`${activeJudges} / ${totalJudges}`}
          subtitle={`${stats?.judgingProgress ?? 0}% judging complete`}
          icon={Gavel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Registrations (24h)</CardTitle>
            <CardDescription>Hourly registration volume</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Submissions by Track</CardTitle>
            <CardDescription>Final submissions per track</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionsByTrack}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Team scores (1–40 scale)</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2, var(--primary)))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent platform events — refreshes every 10 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {(activity ?? []).slice(0, 12).map((item) => {
                const Icon = OVERVIEW_ACTIVITY_ICONS[item.type]
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted',
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p>{item.message}</p>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={item.createdAt}
                      >
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const PARTICIPANTS_PAGE_SIZE = 25

type ParticipantSortKey = keyof OrganizerParticipant | 'index'
type ParticipantSortDir = 'asc' | 'desc'

const PARTICIPANT_STATUS_STYLES = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  submitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
} as const

function ParticipantsPanel() {
  const { data: participants, isLoading } = useParticipants()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<ParticipantSortKey>('registeredAt')
  const [sortDir, setSortDir] = useState<ParticipantSortDir>('desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<OrganizerParticipant | null>(null)

  const debouncedSearch = useDebounce(search)

  const filtered = useMemo(() => {
    let rows = participants ?? []
    const q = debouncedSearch.toLowerCase().trim()
    if (q) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q),
      )
    }
    if (trackFilter !== 'all') {
      rows = rows.filter((p) => p.trackId === trackFilter)
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((p) => p.status === statusFilter)
    }

    rows = [...rows].sort((a, b) => {
      const key = sortKey === 'index' ? 'name' : sortKey
      const av = a[key as keyof OrganizerParticipant] ?? ''
      const bv = b[key as keyof OrganizerParticipant] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [participants, debouncedSearch, trackFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PARTICIPANTS_PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PARTICIPANTS_PAGE_SIZE, page * PARTICIPANTS_PAGE_SIZE)

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
    const rows = (participants ?? []).filter((p) => selected.has(p.userId))
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
            {filtered.length} registration{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={selected.size === 0}
          onClick={exportSelected}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export Selected ({selected.size})
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={trackFilter}
          onValueChange={(v) => {
            setTrackFilter(v)
            setPage(1)
          }}
        >
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
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
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
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pageRows.length > 0 && pageRows.every((p) => selected.has(p.userId))}
                  onCheckedChange={toggleAllPage}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="w-10 cursor-pointer" onClick={() => toggleSort('index')}>
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
                  onClick={() => toggleSort(key)}
                >
                  {label}
                  {sortKey === key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((participant, idx) => (
              <TableRow
                key={participant.userId}
                className="cursor-pointer"
                onClick={() => setDetail(participant)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(participant.userId)}
                    onCheckedChange={() => toggleRow(participant.userId)}
                    aria-label={`Select ${participant.name}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(page - 1) * PARTICIPANTS_PAGE_SIZE + idx + 1}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>{detail.email}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">College / Org</dt>
                  <dd className="font-medium">{detail.college ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Team</dt>
                  <dd className="font-medium">{detail.teamName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Track</dt>
                  <dd className="font-medium">{detail.trackName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Registration Code</dt>
                  <dd className="font-mono font-medium">{detail.registrationCode}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline" className={PARTICIPANT_STATUS_STYLES[detail.status]}>
                      {detail.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Registered</dt>
                  <dd className="font-medium">{formatDateTime(detail.registeredAt)}</dd>
                </div>
              </dl>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

const SUBMISSION_STATUS_STYLES = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  scored: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
} as const

function SubmissionsPanel() {
  const { data: submissions, isLoading } = useOrganizerSubmissions()
  const { data: judges } = useOrganizerJudges()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const assignMutation = useAssignSubmissionJudge()
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detail, setDetail] = useState<OrganizerSubmissionSummary | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let rows = submissions ?? []
    if (trackFilter !== 'all') {
      rows = rows.filter((s) => s.trackId === trackFilter)
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((s) => s.status === statusFilter)
    }
    return rows
  }, [submissions, trackFilter, statusFilter])

  const handleAssign = async (submissionId: string, judgeId: string) => {
    try {
      await assignMutation.mutateAsync({ submissionId, judgeId })
      toast.success('Judge assigned successfully')
      setAssigningId(null)
    } catch {
      toast.error('Failed to assign judge')
    }
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Submissions</h2>
        <p className="text-muted-foreground">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={trackFilter} onValueChange={setTrackFilter}>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Project Title</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.teamName}</TableCell>
                <TableCell className="max-w-[200px] truncate">{submission.title}</TableCell>
                <TableCell className="max-w-[120px] truncate">{submission.trackName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(SUBMISSION_STATUS_STYLES[submission.status])}>
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {submission.averageScore != null
                    ? submission.averageScore.toFixed(1)
                    : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetail(submission)}>
                      View
                    </Button>
                    {!submission.isDraft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAssigningId(
                            assigningId === submission.id ? null : submission.id,
                          )
                        }
                      >
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  {assigningId === submission.id && (
                    <div className="mt-2 flex justify-end gap-2">
                      <Select
                        onValueChange={(judgeId) => handleAssign(submission.id, judgeId)}
                      >
                        <SelectTrigger className="h-8 w-44">
                          <SelectValue placeholder="Assign judge" />
                        </SelectTrigger>
                        <SelectContent>
                          {(judges ?? []).map((judge) => (
                            <SelectItem key={judge.id} value={judge.id}>
                              {judge.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.title}</SheetTitle>
                <SheetDescription>
                  {detail.teamName} · {detail.trackName}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <p className="text-muted-foreground">{detail.description}</p>
                <div className="flex flex-wrap gap-2">
                  {detail.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <a
                    href={detail.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Demo <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={detail.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Repository <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant="outline" className={SUBMISSION_STATUS_STYLES[detail.status]}>
                        {detail.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg Score</dt>
                    <dd className="font-medium tabular-nums">
                      {detail.averageScore?.toFixed(1) ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Judge Reviews</dt>
                    <dd className="font-medium">{detail.scoreCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Assigned Judges</dt>
                    <dd className="font-medium">{detail.assignedJudgeIds.length}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function JudgesPanel() {
  const { data: judges, isLoading } = useOrganizerJudges()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const assignMutation = useAssignJudge()
  const [selectedJudge, setSelectedJudge] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('')

  const handleAssign = async () => {
    if (!selectedJudge || !selectedTrack) {
      toast.error('Select both a judge and a track')
      return
    }
    try {
      await assignMutation.mutateAsync({ judgeId: selectedJudge, trackId: selectedTrack })
      toast.success('Judge assigned to track')
      setSelectedJudge('')
      setSelectedTrack('')
    } catch {
      toast.error('Failed to assign judge')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Judges</h2>
        <p className="text-muted-foreground">Manage judge assignments and review progress</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-medium">Assign Judge to Track</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="judge-select">
              Judge
            </label>
            <Select value={selectedJudge} onValueChange={setSelectedJudge}>
              <SelectTrigger id="judge-select">
                <SelectValue placeholder="Select judge" />
              </SelectTrigger>
              <SelectContent>
                {(judges ?? []).map((judge) => (
                  <SelectItem key={judge.id} value={judge.id}>
                    {judge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="track-select">
              Track
            </label>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger id="track-select">
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent>
                {event?.tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssign} disabled={assignMutation.isPending}>
            Assign
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judge Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Track</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Reviewed</TableHead>
              <TableHead className="text-right">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(judges ?? []).map((judge) => (
              <TableRow key={judge.id}>
                <TableCell className="font-medium">{judge.name}</TableCell>
                <TableCell>{judge.email}</TableCell>
                <TableCell>{judge.assignedTrackName ?? 'Unassigned'}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {judge.assignedProjectCount}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                  {judge.reviewedCount}
                </TableCell>
                <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                  {judge.pendingCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const ANNOUNCEMENT_PRIORITY_PREVIEW = {
  info: {
    label: 'Info',
    className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
  },
  warning: {
    label: 'Warning',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  urgent: {
    label: 'Urgent',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  },
} as const

function AnnouncementsPanel() {
  const { data: announcements, isLoading } = useEventAnnouncements(DEFAULT_EVENT_ID)
  const { data: participants } = useParticipants()
  const broadcastMutation = useBroadcastAnnouncement()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<Announcement['priority']>('info')

  const totalParticipants = participants?.length ?? 0

  const sentAnnouncements = useMemo(
    () =>
      [...(announcements ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [announcements],
  )

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }
    try {
      await broadcastMutation.mutateAsync({
        eventId: DEFAULT_EVENT_ID,
        title: title.trim(),
        message: message.trim(),
        priority,
      })
      toast.success('Announcement broadcast to all participants')
      setTitle('')
      setMessage('')
      setPriority('info')
    } catch {
      toast.error('Failed to broadcast announcement')
    }
  }

  const previewConfig = ANNOUNCEMENT_PRIORITY_PREVIEW[priority]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <p className="text-muted-foreground">Compose and broadcast updates to participants</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-message">Message</Label>
              <Textarea
                id="ann-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as Announcement['priority'])}
                className="flex flex-wrap gap-4"
              >
                {(['info', 'warning', 'urgent'] as const).map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <RadioGroupItem value={p} id={`priority-${p}`} />
                    <Label htmlFor={`priority-${p}`} className="cursor-pointer capitalize">
                      {p}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button
              className="w-full"
              onClick={handleBroadcast}
              disabled={broadcastMutation.isPending}
            >
              <Megaphone className="mr-2 h-4 w-4" aria-hidden="true" />
              Broadcast to All Participants
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className={cn('gap-1', previewConfig.className)}>
                  {previewConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
              <h4 className="font-medium">{title || 'Announcement title'}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {message || 'Your message will appear here as you type...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sent Announcements</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sentAnnouncements.map((announcement) => {
              const readCount = announcement.readBy.length
              return (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn('gap-1', ANNOUNCEMENT_PRIORITY_PREVIEW[announcement.priority].className)}
                    >
                      {ANNOUNCEMENT_PRIORITY_PREVIEW[announcement.priority].label}
                    </Badge>
                    <time className="text-xs text-muted-foreground" dateTime={announcement.createdAt}>
                      {formatDateTime(announcement.createdAt)} (
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })})
                    </time>
                  </div>
                  <h4 className="font-medium">{announcement.title}</h4>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {announcement.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Read by {readCount}/{totalParticipants} participants
                  </p>
                </div>
              )
            })}
            {sentAnnouncements.length === 0 && (
              <AnnouncementFeed announcements={[]} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LeaderboardDeltaIndicator({ delta }: { delta: number }) {
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
    </span>
  )
}

function LeaderboardPanel() {
  const { data: leaderboard, isLoading, statusQuery, publishMutation } = useLeaderboard(
    DEFAULT_EVENT_ID,
    {
      forOrganizer: true,
      includeStatus: true,
      refetchInterval: 30_000,
    },
  )
  const { data: submissions } = useOrganizerSubmissions()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const [trackFilter, setTrackFilter] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingPublish, setPendingPublish] = useState<boolean | null>(null)

  const published = statusQuery.data?.published ?? false

  const scoreBreakdowns = useMemo(() => {
    const map = new Map<
      string,
      { innovation: number; technicalExecution: number; impact: number; presentation: number }
    >()
    for (const sub of submissions ?? []) {
      if (sub.scoreBreakdown) {
        map.set(sub.teamId, sub.scoreBreakdown)
      }
    }
    return map
  }, [submissions])

  const filtered = useMemo(() => {
    let rows = leaderboard ?? []
    if (trackFilter !== 'all') {
      rows = rows.filter((e) => e.trackId === trackFilter)
    }
    return rows
  }, [leaderboard, trackFilter])

  const trackName = (trackId: string) =>
    event?.tracks.find((t) => t.id === trackId)?.name ?? trackId

  const handlePublishToggle = (next: boolean) => {
    setPendingPublish(next)
    setConfirmOpen(true)
  }

  const confirmPublish = async () => {
    if (pendingPublish == null) return
    try {
      await publishMutation.mutateAsync(pendingPublish)
      toast.success(
        pendingPublish ? 'Results are now live for participants' : 'Results hidden from participants',
      )
    } catch {
      toast.error('Failed to update publish status')
    } finally {
      setConfirmOpen(false)
      setPendingPublish(null)
    }
  }

  const exportCsv = () => {
    downloadCsv(
      'leaderboard-export.csv',
      ['Rank', 'Team', 'Track', 'Score', 'Delta'],
      filtered.map((e) => [
        String(e.rank),
        e.teamName,
        trackName(e.trackId),
        e.score.toFixed(1),
        String(e.delta),
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
        <Select value={trackFilter} onValueChange={setTrackFilter}>
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
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button
            variant={published ? 'outline' : 'default'}
            onClick={() => handlePublishToggle(!published)}
            disabled={publishMutation.isPending}
          >
            {published ? 'Unpublish Results' : 'Publish Results'}
          </Button>
        </div>
      </div>

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
            {filtered.map((entry) => {
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingPublish ? 'Publish Results?' : 'Unpublish Results?'}
            </DialogTitle>
            <DialogDescription>
              {pendingPublish
                ? 'Participants will immediately see the leaderboard on their dashboards.'
                : 'The leaderboard will be hidden from all participant dashboards.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPublish} disabled={publishMutation.isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrganizerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(() => parseTab(searchParams.get('tab')), [searchParams])
  const { data: event } = useEvent(DEFAULT_EVENT_ID)

  const setActiveTab = (tab: OrganizerTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="border-b bg-card/50">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                <h1 className="text-xl font-bold tracking-tight">Organizer Hub</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {event?.title ?? 'Loading event...'}
              </p>
            </div>
          </div>
        </div>
        <nav
          className="container mx-auto max-w-7xl overflow-x-auto px-4 pb-0"
          aria-label="Organizer dashboard tabs"
        >
          <div className="flex min-w-max gap-1 border-b-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <main id="main-content" className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {activeTab === 'overview' && <OverviewPanel />}
          {activeTab === 'participants' && <ParticipantsPanel />}
          {activeTab === 'submissions' && <SubmissionsPanel />}
          {activeTab === 'judges' && <JudgesPanel />}
          {activeTab === 'announcements' && <AnnouncementsPanel />}
          {activeTab === 'leaderboard' && <LeaderboardPanel />}
        </div>
      </main>
    </div>
  )
}
