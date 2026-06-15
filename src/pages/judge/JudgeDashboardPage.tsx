import { useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ProjectDetail, ReviewQueue } from '@/features/judge'
import { useJudgeQueue } from '@/hooks/useJudgeQueue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type QueueFilter = 'all' | 'pending' | 'completed'

function subscribeToDesktop(cb: () => void) {
  const mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getDesktopSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches
}

function getServerSnapshot() {
  return true
}

export default function JudgeDashboardPage() {
  const { data: queue = [], isLoading } = useJudgeQueue()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerSnapshot)

  const pendingItems = useMemo(() => queue.filter((item) => !item.scored), [queue])
  const effectiveSelectedId = selectedId ?? pendingItems[0]?.submissionId ?? null

  const selectedItem = queue.find((item) => item.submissionId === effectiveSelectedId)

  const handleSelect = (submissionId: string) => {
    setSelectedId(submissionId)
    if (!isDesktop) {
      setMobileOpen(true)
    }
  }

  const handleScored = () => {
    if (!isDesktop) {
      setMobileOpen(false)
    }
    const nextPending = queue.find((item) => !item.scored && item.submissionId !== selectedId)
    if (nextPending) {
      setSelectedId(nextPending.submissionId)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Judge Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Review submissions and submit your scores
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/judge/completed">
              <ClipboardList className="mr-2 h-4 w-4" aria-hidden="true" />
              Completed reviews
            </Link>
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:gap-4">
          <div className="min-h-[400px] lg:min-h-0">
            <ReviewQueue
              items={queue}
              selectedId={effectiveSelectedId}
              filter={filter}
              onFilterChange={setFilter}
              onSelect={handleSelect}
              isLoading={isLoading}
            />
          </div>

          <div
            className={cn(
              'hidden min-h-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:block',
            )}
          >
            {effectiveSelectedId ? (
              <ProjectDetail
                submissionId={effectiveSelectedId}
                queueItem={selectedItem}
                onScored={handleScored}
              />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a submission from the queue to begin reviewing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>Submission review</SheetTitle>
          </SheetHeader>
          {effectiveSelectedId && (
            <ProjectDetail
              submissionId={effectiveSelectedId}
              queueItem={selectedItem}
              onScored={handleScored}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
