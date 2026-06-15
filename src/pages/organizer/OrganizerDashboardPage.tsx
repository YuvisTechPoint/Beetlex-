import { lazy, Suspense, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { useEvent } from '@/hooks/useEvent'
import { cn } from '@/lib/utils'
import { DEFAULT_EVENT_ID, TABS, type OrganizerTab, parseTab } from '@/features/organizer'

const OverviewPanel = lazy(() => import('@/features/organizer/panels/OverviewPanel'))
const ParticipantsPanel = lazy(() => import('@/features/organizer/panels/ParticipantsPanel'))
const SubmissionsPanel = lazy(() => import('@/features/organizer/panels/SubmissionsPanel'))
const JudgesPanel = lazy(() => import('@/features/organizer/panels/JudgesPanel'))
const AnnouncementsPanel = lazy(() => import('@/features/organizer/panels/AnnouncementsPanel'))
const LeaderboardPanel = lazy(() => import('@/features/organizer/panels/LeaderboardPanel'))

function PanelFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

function ActivePanel({ tab }: { tab: OrganizerTab }) {
  switch (tab) {
    case 'overview':
      return <OverviewPanel />
    case 'participants':
      return <ParticipantsPanel />
    case 'submissions':
      return <SubmissionsPanel />
    case 'judges':
      return <JudgesPanel />
    case 'announcements':
      return <AnnouncementsPanel />
    case 'leaderboard':
      return <LeaderboardPanel />
  }
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
              <p className="text-sm text-muted-foreground">{event?.title ?? 'Loading event...'}</p>
            </div>
          </div>
        </div>
        <nav
          className="container mx-auto max-w-7xl mobile-scroll-x px-4 pb-0 sm:overflow-visible"
          aria-label="Organizer dashboard tabs"
        >
          <div className="flex min-w-max snap-x snap-mandatory gap-1 border-b-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex shrink-0 snap-start items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4',
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
          <Suspense fallback={<PanelFallback />}>
            <ActivePanel tab={activeTab} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
