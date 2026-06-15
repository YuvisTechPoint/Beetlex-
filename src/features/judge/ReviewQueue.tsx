import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, Inbox } from 'lucide-react'
import type { JudgeQueueItem } from '@/api/judges'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type QueueFilter = 'all' | 'pending' | 'completed'

interface ReviewQueueProps {
  items: JudgeQueueItem[]
  selectedId: string | null
  filter: QueueFilter
  onFilterChange: (filter: QueueFilter) => void
  onSelect: (submissionId: string) => void
  isLoading?: boolean
}

function filterItems(items: JudgeQueueItem[], filter: QueueFilter) {
  switch (filter) {
    case 'pending':
      return items.filter((item) => !item.scored)
    case 'completed':
      return items.filter((item) => item.scored)
    default:
      return items
  }
}

export function ReviewQueue({
  items,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  isLoading,
}: ReviewQueueProps) {
  const scoredCount = items.filter((item) => item.scored).length
  const progress = items.length > 0 ? Math.round((scoredCount / items.length) * 100) : 0
  const filtered = filterItems(items, filter)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">Review progress</h2>
          <span className="text-sm text-muted-foreground">
            {scoredCount} of {items.length} reviewed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as QueueFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({items.length - scoredCount})
          </TabsTrigger>
          <TabsTrigger value="completed">Done ({scoredCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">No submissions here</p>
            <p className="text-xs text-muted-foreground">
              {filter === 'pending' ? 'All caught up!' : 'Try a different filter'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.submissionId}
              type="button"
              onClick={() => onSelect(item.submissionId)}
              className="w-full text-left"
            >
              <Card
                className={cn(
                  'transition-colors hover:bg-muted/50',
                  selectedId === item.submissionId && 'border-primary ring-1 ring-primary',
                )}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{item.teamName}</p>
                    </div>
                    {item.scored ? (
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Scored
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.trackName}</Badge>
                    {item.submittedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
