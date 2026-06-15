import { formatDate, formatDateTime } from '@/utils'
import type { Event } from '@/types'
import { cn } from '@/lib/utils'

interface EventTimelineSectionProps {
  timeline: Event['timeline']
}

export function EventTimelineSection({ timeline }: EventTimelineSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Timeline</h2>
      <ol className="hidden gap-4 md:grid md:grid-cols-5">
        {timeline.map((item, index) => {
          const itemTime = new Date(item.date).getTime()
          const nextTime =
            index < timeline.length - 1 ? new Date(timeline[index + 1].date).getTime() : Infinity
          const isPast = itemTime < Date.now()
          const isCurrent = itemTime <= Date.now() && Date.now() < nextTime
          return (
            <li
              key={item.label}
              className={cn(
                'rounded-lg border p-3 text-center',
                isPast && 'border-primary/30 bg-primary/5',
                isCurrent && 'border-primary ring-1 ring-primary/30',
              )}
            >
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {isPast ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
              </p>
              <p className="mt-1 text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
            </li>
          )
        })}
      </ol>
      <ol className="relative space-y-0 border-l border-border pl-6 md:hidden">
        {timeline.map((item, index) => {
          const itemTime = new Date(item.date).getTime()
          const nextTime =
            index < timeline.length - 1 ? new Date(timeline[index + 1].date).getTime() : Infinity
          const isCurrent = itemTime <= Date.now() && Date.now() < nextTime
          return (
            <li key={item.label} className="relative pb-8 last:pb-0">
              <span
                className={cn(
                  'absolute -left-[25px] flex h-3 w-3 items-center justify-center rounded-full border-2 bg-background',
                  isCurrent ? 'border-primary' : 'border-muted-foreground/40',
                )}
              />
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(item.date)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
