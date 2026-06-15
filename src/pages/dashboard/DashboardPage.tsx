import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  Circle,
  Clock,
  Copy,
  Crown,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Send,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { leaveTeam, removeTeamMember } from '@/api/registrations'
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed'
import { Leaderboard } from '@/components/shared/Leaderboard'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useEvent } from '@/hooks/useEvent'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useMySubmission } from '@/hooks/useMySubmission'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'
import { useEventAnnouncements } from '@/hooks/useEventAnnouncements'
import { useCountdown } from '@/hooks/useCountdown'
import { useNotificationStore } from '@/store/notificationStore'
import { useLeaderboardStore } from '@/store/leaderboardStore'
import type { LeaderboardConnectionMode } from '@/store/leaderboardStore'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardTab = 'overview' | 'team' | 'leaderboard' | 'resources' | 'announcements'

const VALID_TABS: DashboardTab[] = [
  'overview',
  'team',
  'leaderboard',
  'resources',
  'announcements',
]

const DASHBOARD_RESOURCES = [
  {
    title: 'API Documentation',
    description: 'Complete reference for BeetleX platform APIs, webhooks, and SDKs.',
    href: 'https://docs.beetlex.dev/api',
    icon: BookOpen,
  },
  {
    title: 'Problem Statements',
    description: 'Detailed track challenges, evaluation criteria, and datasets.',
    href: '#problem-statements',
    icon: FileText,
  },
  {
    title: 'Mentor Schedule',
    description: 'Book 1:1 office hours with engineers from sponsor companies.',
    href: 'https://cal.beetlex.dev/mentors',
    icon: Calendar,
  },
  {
    title: 'Discord Community',
    description: 'Get help, find teammates, and attend live AMA sessions.',
    href: 'https://discord.gg/beetlex',
    icon: MessageCircle,
  },
] as const

interface NavItem {
  id: DashboardTab | 'submit'
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'team', label: 'My Team', icon: Users },
  { id: 'submit', label: 'Submit Project', icon: Send, href: '/dashboard/submit' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'announcements', label: 'Announcements', icon: Bell },
]

const STATUS_CONFIG: Record<
  LeaderboardConnectionMode,
  { label: string; dotClass: string; icon: typeof Wifi }
> = {
  connecting: { label: 'Connecting…', dotClass: 'bg-amber-500 animate-pulse', icon: Wifi },
  live: { label: 'Live', dotClass: 'bg-emerald-500', icon: Wifi },
  degraded: { label: 'Updating every 10s', dotClass: 'bg-amber-500', icon: WifiOff },
  disconnected: { label: 'Disconnected', dotClass: 'bg-red-500', icon: WifiOff },
}

const MODE_LABELS: Record<LeaderboardConnectionMode, string> = {
  live: 'Live',
  degraded: 'Updating every 10s',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
}

function parseTab(value: string | null): DashboardTab {
  if (value && VALID_TABS.includes(value as DashboardTab)) {
    return value as DashboardTab
  }
  return 'overview'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const showBadge = item.id === 'announcements' && unreadCount > 0

  const content = (
    <>
      <span className="relative">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {showBadge && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
      <span>{item.label}</span>
    </>
  )

  const className = cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-current={active ? 'page' : undefined}>
      {content}
    </button>
  )
}

function ConnectionStatus() {
  const connectionMode = useLeaderboardStore((s) => s.connectionMode)
  const config = STATUS_CONFIG[connectionMode]
  const Icon = config.icon

  return (
    <div
      className="flex items-center gap-2 text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.label}`}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} aria-hidden="true" />
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  )
}

function DashboardShell({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const isSubmitPage = location.pathname === '/dashboard/submit'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside
          className="hidden w-60 shrink-0 border-r bg-card/50 md:block"
          aria-label="Dashboard navigation"
        >
          <nav className="sticky top-14 flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={item.id === 'submit' ? isSubmitPage : activeTab === item.id}
                onClick={() => {
                  if (item.href) {
                    navigate(item.href)
                  } else if (item.id !== 'submit') {
                    onTabChange(item.id)
                  }
                }}
              />
            ))}
          </nav>
        </aside>

        <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-8">
          <div className="container mx-auto max-w-6xl px-4 py-6">{children}</div>
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
        aria-label="Mobile dashboard navigation"
      >
        <div className="grid grid-cols-5 gap-0">
          {NAV_ITEMS.filter((item) => item.id !== 'submit').map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id as DashboardTab)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </button>
            )
          })}
          <Link
            to="/dashboard/submit"
            className={cn(
              'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
              isSubmitPage ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span>Submit</span>
          </Link>
        </div>
      </nav>

      <footer className="border-t bg-muted/30 px-4 py-2 pb-safe md:pb-2">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">
          <p className="hidden text-xs text-muted-foreground md:block">BeetleX Participant Dashboard</p>
          <ConnectionStatus />
        </div>
      </footer>
    </div>
  )
}

function StatusCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description?: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

function OverviewPanel() {
  const { user } = useAuth()
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const eventId = team?.eventId
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: submission } = useMySubmission()
  const { data: leaderboard, isLoading: leaderboardLoading, published } = useLeaderboard(
    team?.eventId ?? 'evt-active-1',
    { refetchInterval: 30_000 },
  )
  const { data: announcements, isLoading: announcementsLoading } = useEventAnnouncements(eventId)
  const countdown = useCountdown(event?.submissionDeadline)

  const isLoading = teamLoading || eventLoading

  const teamFormed = team && team.members.length >= (event?.teamMinSize ?? 2)
  const submissionStatus = submission
    ? submission.isDraft
      ? 'draft'
      : 'submitted'
    : (team?.submissionStatus ?? 'not_started')

  const position = team?.leaderboardPosition
  const totalTeams = leaderboard?.length ?? 0

  const trackerSteps = [
    { label: 'Team Formed', done: teamFormed },
    {
      label: 'Project Started',
      done: submissionStatus === 'draft' || submissionStatus === 'submitted',
      active: submissionStatus === 'draft',
    },
    { label: 'Submitted', done: submissionStatus === 'submitted' },
  ]

  const progressValue =
    submissionStatus === 'submitted' ? 100 : submissionStatus === 'draft' ? 66 : teamFormed ? 33 : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  if (!team || !event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to BeetleX</CardTitle>
          <CardDescription>You are not registered for an active hackathon yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const timeLeftLabel = countdown.isExpired
    ? 'Deadline passed'
    : countdown.days > 0
      ? `${countdown.days}d ${countdown.hours}h left`
      : `${countdown.hours}h ${countdown.minutes}m left`

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          {event.title} ends in{' '}
          {countdown.isExpired ? (
            <span className="font-medium text-destructive">0 days (closed)</span>
          ) : (
            <span className="font-medium text-foreground">
              {countdown.days} day{countdown.days !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Team Status"
          value={teamFormed ? 'Formed' : 'Incomplete'}
          description={`${team.members.length} member${team.members.length !== 1 ? 's' : ''}`}
          icon={Users}
        />
        <StatusCard
          title="Submission Status"
          value={
            submissionStatus === 'submitted'
              ? 'Submitted'
              : submissionStatus === 'draft'
                ? 'Draft saved'
                : 'Not started'
          }
          icon={Send}
        />
        <StatusCard
          title="Your Position"
          value={position ? `#${position}` : '—'}
          description={totalTeams > 0 ? `of ${totalTeams} teams` : 'Leaderboard updating'}
          icon={Check}
        />
        <StatusCard
          title="Time Left"
          value={timeLeftLabel}
          description="Until submission deadline"
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Progress</CardTitle>
          <CardDescription>Track your team&apos;s journey to final submission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progressValue} className="h-2" />
          <div className="grid gap-4 sm:grid-cols-3">
            {trackerSteps.map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 transition-colors',
                  step.done && 'border-primary/30 bg-primary/5',
                  step.active && 'ring-2 ring-primary/20',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    step.done ? 'bg-primary text-primary-foreground' : 'bg-muted',
                  )}
                >
                  {step.done ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : step.active ? (
                    <Circle className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.label}</p>
                  {step.active && <p className="text-xs text-primary">In progress</p>}
                </div>
              </div>
            ))}
          </div>
          {submissionStatus !== 'submitted' && (
            <Button asChild>
              <Link to="/dashboard/submit">
                {submissionStatus === 'draft' ? 'Continue Submission' : 'Start Submission'}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementFeed
              announcements={announcements ?? []}
              isLoading={announcementsLoading}
              limit={3}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/dashboard?tab=leaderboard">View Full Leaderboard</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {published === false ? (
              <p className="text-sm text-muted-foreground">
                Leaderboard results are hidden until organizers publish them.
              </p>
            ) : (
              <Leaderboard
                entries={leaderboard ?? []}
                currentTeamId={team.id}
                isLoading={leaderboardLoading}
                compact
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Quick links to help you build faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {DASHBOARD_RESOURCES.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamPanel() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: team, isLoading } = useMyTeam()
  const { data: event } = useEvent(team?.eventId)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const leaveMutation = useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      toast.success('You have left the team')
    },
    onError: () => toast.error('Failed to leave team'),
  })

  const removeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      toast.success('Member removed')
    },
    onError: () => toast.error('Failed to remove member'),
  })

  const isLeader = team?.members.some((m) => m.userId === user?.id && m.role === 'leader')

  const copyInviteCode = async () => {
    if (!team) return
    const link = `${window.location.origin}/events/${team.eventId}/register?invite=${team.inviteCode}`
    await navigator.clipboard.writeText(link)
    toast.success('Invite link copied to clipboard')
  }

  const copyCode = async () => {
    if (!team) return
    await navigator.clipboard.writeText(team.inviteCode)
    toast.success('Invite code copied')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No team found</CardTitle>
          <CardDescription>Register for an event or join a team with an invite code.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const trackName = event?.tracks.find((t) => t.id === team.trackId)?.name ?? 'Unknown track'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription>{trackName}</CardDescription>
            </div>
            <Badge variant="secondary">{team.submissionStatus.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-muted px-3 py-1.5 text-sm font-mono">{team.inviteCode}</code>
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy code
            </Button>
            <Button variant="outline" size="sm" onClick={copyInviteCode}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite member
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {team.members.length} of {event?.teamMaxSize ?? 4} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y" role="list">
            {team.members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'leader' ? 'default' : 'outline'}>
                    {member.role === 'leader' && <Crown className="mr-1 h-3 w-3" aria-hidden="true" />}
                    {member.role}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </span>
                  {isLeader && member.role !== 'leader' && member.userId !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRemoveTarget(member.userId)}
                      aria-label={`Remove ${member.name}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="text-destructive" onClick={() => setLeaveOpen(true)}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Leave team
        </Button>
      </div>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave team?</DialogTitle>
            <DialogDescription>
              You will lose access to this team&apos;s submission. This action cannot be undone in the
              demo environment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={leaveMutation.isPending}
              onClick={() => {
                leaveMutation.mutate(undefined, {
                  onSuccess: () => setLeaveOpen(false),
                })
              }}
            >
              Leave team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removeTarget)} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              They will no longer have access to this team&apos;s workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => {
                if (!removeTarget) return
                removeMutation.mutate(removeTarget, {
                  onSuccess: () => setRemoveTarget(null),
                })
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LeaderboardPanel() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const eventId = team?.eventId ?? 'evt-active-1'
  const { entries, isLoading, published, connectionMode, isError } = useLeaderboardStream({
    eventId,
    enabled: !teamLoading,
  })

  if (teamLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">Live rankings based on judge scores.</p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Could not load leaderboard</AlertTitle>
          <AlertDescription>
            Check your connection and refresh the page. If you just signed in, try again in a moment.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!published) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">Results will appear here once organizers publish them.</p>
        </div>
        <Alert>
          <AlertTitle>Results are hidden</AlertTitle>
          <AlertDescription>
            The leaderboard is not yet published. Check back after judging is complete.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            Live rankings based on judge scores. Streamed via SSE with polling fallback.
          </p>
        </div>
        <Badge variant={connectionMode === 'live' ? 'default' : 'secondary'} className="gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionMode === 'live'
                ? 'bg-emerald-500'
                : connectionMode === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-muted-foreground'
            }`}
            aria-hidden="true"
          />
          {MODE_LABELS[connectionMode]}
        </Badge>
      </div>
      <Leaderboard entries={entries} currentTeamId={team?.id} />
    </div>
  )
}

function ResourcesPanel() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const { data: event, isLoading: eventLoading } = useEvent(team?.eventId)

  if (teamLoading || eventLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
        <p className="text-muted-foreground">
          Everything you need to build and submit for {event?.title ?? 'your hackathon'}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {DASHBOARD_RESOURCES.map((resource) => {
          const Icon = resource.icon
          return (
            <Card key={resource.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-sm leading-relaxed">
                  {resource.description}
                </CardDescription>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open resource
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {event && (
        <Card>
          <CardHeader>
            <CardTitle>Track Problem Statements</CardTitle>
            <CardDescription>Your event has {event.tracks.length} tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.tracks.map((track) => (
              <div key={track.id} id="problem-statements" className="rounded-lg border p-4">
                <h3 className="font-semibold">{track.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{track.problemStatement}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {track.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AnnouncementsPanel() {
  const { data: team } = useMyTeam()
  const { data: announcements, isLoading } = useEventAnnouncements(team?.eventId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <p className="text-muted-foreground">
          Important updates from organizers. Click an item to mark related notifications as read.
        </p>
      </div>
      <AnnouncementFeed announcements={announcements ?? []} />
    </div>
  )
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(() => parseTab(searchParams.get('tab')), [searchParams])

  const setActiveTab = (tab: DashboardTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <DashboardShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && <OverviewPanel />}
      {activeTab === 'team' && <TeamPanel />}
      {activeTab === 'leaderboard' && <LeaderboardPanel />}
      {activeTab === 'resources' && <ResourcesPanel />}
      {activeTab === 'announcements' && <AnnouncementsPanel />}
    </DashboardShell>
  )
}
