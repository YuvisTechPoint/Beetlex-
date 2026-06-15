import { formatDistanceToNow } from 'date-fns'
import { Activity, ClipboardList, Gavel, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { OrganizerActivityItem } from '@/api/organizer'

const ACTIVITY_ICONS = {
  registration: Users,
  submission: ClipboardList,
  score: Gavel,
  announcement: Activity,
} as const

interface OverviewActivityFeedProps {
  activity?: OrganizerActivityItem[]
  isLoading: boolean
}

export function OverviewActivityFeed({ activity, isLoading }: OverviewActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent platform events — refreshes every 10 seconds</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {(activity ?? []).slice(0, 12).map((item) => {
              const Icon = ACTIVITY_ICONS[item.type]
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
                    <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
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
  )
}
