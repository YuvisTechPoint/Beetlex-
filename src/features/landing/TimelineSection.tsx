import { format } from 'date-fns'
import type { Event } from '@/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface TimelineSectionProps {
  event?: Event
  isLoading?: boolean
}

type TimelineItem = Event['timeline'][number]

function TimelineDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="text-sm font-semibold text-primary">
      {format(new Date(date), 'MMM d, yyyy')}
    </time>
  )
}

function TimelineCopy({ item }: { item: TimelineItem }) {
  return (
    <>
      <TimelineDate date={item.date} />
      <h3 className="mt-1 text-base font-semibold leading-snug text-foreground md:text-lg">
        {item.label}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{item.description}</p>
    </>
  )
}

function TimelineDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative z-10 box-border h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_hsl(var(--muted)/0.35)]',
        className,
      )}
      aria-hidden="true"
    />
  )
}

function MobileTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-0 md:hidden">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <li key={item.label} className="relative flex gap-4">
            <div className="flex w-5 flex-col items-center">
              <TimelineDot className="mt-1.5" />
              {!isLast && <span className="mt-2 w-0.5 flex-1 bg-primary/35" aria-hidden="true" />}
            </div>
            <div className={cn('min-w-0 flex-1', !isLast && 'pb-8')}>
              <TimelineCopy item={item} />
              <span className="sr-only">
                Milestone {index + 1} of {items.length}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function TabletTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="hidden md:grid md:grid-cols-2 md:gap-4 lg:hidden">
      {items.map((item, index) => (
        <li
          key={item.label}
          className="rounded-xl border border-border/50 bg-background/60 p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <TimelineDot />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Step {index + 1}
            </span>
          </div>
          <TimelineCopy item={item} />
        </li>
      ))}
    </ol>
  )
}

function DesktopTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="hidden lg:grid lg:grid-cols-6 lg:gap-3 xl:gap-4">
      {items.map((item, index) => {
        const isFirst = index === 0
        const isLast = index === items.length - 1
        return (
          <li key={item.label} className="relative flex flex-col items-center text-center">
            <div className="relative flex h-4 w-full items-center justify-center">
              {!isFirst && (
                <span
                  className="absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 bg-primary/35"
                  aria-hidden="true"
                />
              )}
              {!isLast && (
                <span
                  className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 bg-primary/35"
                  aria-hidden="true"
                />
              )}
              <TimelineDot />
            </div>
            <div className="mt-4 w-full px-1">
              <time
                dateTime={item.date}
                className="text-xs font-semibold text-primary xl:text-sm"
              >
                {format(new Date(item.date), 'MMM d')}
              </time>
              <h3 className="mt-1 text-sm font-semibold leading-snug xl:text-base">{item.label}</h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/70 xl:text-sm">
                {item.description}
              </p>
            </div>
            <span className="sr-only">
              Milestone {index + 1} of {items.length}: {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function TimelineSection({ event, isLoading }: TimelineSectionProps) {
  const items = event?.timeline ?? []

  return (
    <section
      id="timeline"
      className="scroll-mt-20 border-y bg-muted/30 py-16 pb-24 md:py-20 md:pb-28"
      aria-labelledby="timeline-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="timeline-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Event Timeline
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:mt-4">
            {event ? `Key dates for ${event.title}` : 'Important milestones for our featured hackathon'}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-6xl md:mt-12">
          {isLoading ? (
            <div className="space-y-4" aria-label="Loading timeline" aria-busy="true">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ) : items.length ? (
            <>
              <MobileTimeline items={items} />
              <TabletTimeline items={items} />
              <DesktopTimeline items={items} />
            </>
          ) : (
            <p className="text-center text-muted-foreground">Timeline coming soon.</p>
          )}
        </div>
      </div>
    </section>
  )
}
