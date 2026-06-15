import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Copy,
  HelpCircle,
  Share2,
  Trophy,
  Users,
} from 'lucide-react'
import { useEvent, useMyRegistrations } from '@/hooks'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { SponsorShowcase } from '@/components/shared/SponsorShowcase'
import { resolveShowcaseSponsors } from '@/data/sponsors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { useCountdown } from '@/hooks/useCountdown'
import { calculatePrizePool, formatDate, formatDateTime } from '@/utils'
import type { Event } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_LABELS: Record<Event['status'], string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
}

const STATUS_VARIANTS: Record<Event['status'], 'default' | 'secondary' | 'outline'> = {
  upcoming: 'secondary',
  active: 'default',
  closed: 'outline',
}

function padCountdown(value: number): string {
  return String(value).padStart(2, '0')
}

function CountdownTimer({
  target,
  label,
}: {
  target: string | Date
  label?: string
}) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target)

  const liveText = isExpired
    ? 'Registration has closed'
    : `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ]

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>
      {isExpired ? (
        <p className="text-sm font-semibold text-destructive">Closed</p>
      ) : (
        <div className="grid grid-cols-4 gap-2" aria-hidden="true">
          {units.map((unit) => (
            <div key={unit.label} className="rounded-lg border bg-muted/50 px-3 py-2 text-center">
              <div className="text-2xl font-bold tabular-nums">{padCountdown(unit.value)}</div>
              <div className="text-xs text-muted-foreground">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EventDetailSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, isError } = useEvent(id, { refetchInterval: 30_000 })
  const { data: registrations } = useMyRegistrations()
  const { isAuthenticated } = useAuth()
  const openSignIn = useUiStore((s) => s.openSignIn)

  const isRegistered = useMemo(
    () => registrations?.some((r) => r.eventId === id) ?? false,
    [registrations, id],
  )

  const registrationOpen = useMemo(() => {
    if (!event) return false
    const now = Date.now()
    return (
      now >= new Date(event.registrationOpen).getTime() &&
      now <= new Date(event.registrationClose).getTime() &&
      event.status !== 'closed'
    )
  }, [event])

  const prizePool = event ? calculatePrizePool(event.prizes) : 0
  const teamCount = event
    ? Math.floor(event.participantCount / ((event.teamMinSize + event.teamMaxSize) / 2))
    : 0

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  const prizesByTrack = useMemo(() => {
    if (!event) return new Map<string, Event['prizes']>()
    const map = new Map<string, Event['prizes']>()
    for (const prize of event.prizes) {
      const existing = map.get(prize.trackId) ?? []
      map.set(prize.trackId, [...existing, prize])
    }
    return map
  }, [event])

  const showcaseSponsors = useMemo(
    () => resolveShowcaseSponsors(event?.sponsors),
    [event?.sponsors],
  )

  if (isLoading) {
    return (
      <>
        <Header />
        <main id="main-content">
          <PageBackNav to="/events" label="Back to Events" />
          <EventDetailSkeleton />
        </main>
        <Footer />
      </>
    )
  }

  if (isError || !event) {
    return (
      <>
        <Header />
        <main id="main-content">
          <PageBackNav to="/events" label="Back to Events" />
          <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-muted-foreground">
            The event you are looking for does not exist or has been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/events">Browse Events</Link>
          </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <PageBackNav to="/events" label="Back to Events" title={event.title} />
        {/* Hero */}
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={STATUS_VARIANTS[event.status]}>
                {STATUS_LABELS[event.status]}
              </Badge>
              <Badge variant="outline">
                <Trophy className="mr-1 h-3 w-3" />
                ${prizePool.toLocaleString()} prize pool
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{event.tagline}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-card/50 p-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Prize Pool</p>
                <p className="text-lg font-bold text-primary">${prizePool.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-lg font-bold">{event.participantCount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Teams</p>
                <p className="text-lg font-bold">~{teamCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tracks</p>
                <p className="text-lg font-bold">{event.tracks.length}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => void copyLink()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Reg closes {formatDate(event.registrationClose)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Submit by {formatDate(event.submissionDeadline)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Teams of {event.teamMinSize}–{event.teamMaxSize}
              </span>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-3 lg:gap-10">
          {/* Main content */}
          <div className="space-y-10 lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-4">
                <p className="leading-relaxed text-muted-foreground">{event.description}</p>
              </TabsContent>
              <TabsContent value="rules" className="mt-4">
                <p className="leading-relaxed text-muted-foreground">{event.rules}</p>
              </TabsContent>
              <TabsContent value="eligibility" className="mt-4">
                <p className="leading-relaxed text-muted-foreground">{event.eligibility}</p>
              </TabsContent>
            </Tabs>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Tracks &amp; Prizes</h2>
              <Accordion type="single" collapsible className="w-full">
                {event.tracks.map((track) => {
                  const trackPrizes = prizesByTrack.get(track.id) ?? []
                  return (
                    <AccordionItem key={track.id} value={track.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div>
                          <p className="font-medium">{track.name}</p>
                          <p className="text-sm font-normal text-muted-foreground">
                            {track.description}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Problem statement</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {track.problemStatement}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {track.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        {trackPrizes.length > 0 && (
                          <div className="rounded-lg border bg-muted/30 p-4">
                            <p className="mb-2 text-sm font-medium">Prizes</p>
                            <ul className="space-y-2">
                              {trackPrizes
                                .sort((a, b) => a.rank - b.rank)
                                .map((prize) => (
                                  <li key={`${prize.trackId}-${prize.rank}`} className="text-sm">
                                    <span className="font-medium">
                                      #{prize.rank} — {prize.currency}{' '}
                                      {prize.amount.toLocaleString()}
                                    </span>
                                    {prize.perks.length > 0 && (
                                      <span className="text-muted-foreground">
                                        {' '}
                                        · {prize.perks.join(', ')}
                                      </span>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Timeline</h2>
              <ol className="hidden gap-4 md:grid md:grid-cols-5">
                {event.timeline.map((item, index) => {
                  const itemTime = new Date(item.date).getTime()
                  const nextTime =
                    index < event.timeline.length - 1
                      ? new Date(event.timeline[index + 1].date).getTime()
                      : Infinity
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
                {event.timeline.map((item, index) => {
                  const itemTime = new Date(item.date).getTime()
                  const nextTime =
                    index < event.timeline.length - 1
                      ? new Date(event.timeline[index + 1].date).getTime()
                      : Infinity
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
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(item.date)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </li>
                  )
                })}
              </ol>
            </section>

            <section>
              <h2 className="mb-6 text-xl font-semibold">Sponsors</h2>
              <SponsorShowcase sponsors={showcaseSponsors} variant="compact" />
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <HelpCircle className="h-5 w-5" />
                FAQ
              </h2>
              <Accordion type="single" collapsible>
                {event.faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <CountdownTimer
                    target={event.registrationClose}
                    label="Registration closes in"
                  />

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <span className="flex items-center gap-1.5 font-semibold tabular-nums">
                      <Users className="h-4 w-4 text-primary" />
                      {event.participantCount.toLocaleString()}
                    </span>
                  </div>

                  {isRegistered ? (
                    <Button className="w-full" variant="secondary" asChild>
                      <Link to="/dashboard">View Dashboard</Link>
                    </Button>
                  ) : registrationOpen && isAuthenticated ? (
                    <Button className="w-full" asChild>
                      <Link to={`/events/${event.id}/register`}>Register Now</Link>
                    </Button>
                  ) : registrationOpen ? (
                    <Button className="w-full" onClick={openSignIn}>
                      Sign in to Register
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      Registration Closed
                    </Button>
                  )}

                  {!isAuthenticated && registrationOpen && (
                    <p className="text-center text-xs text-muted-foreground">
                      Sign in to continue registration for this event.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Mobile sticky CTA */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
          role="region"
          aria-label="Registration actions"
        >
          <div className="container mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {event.participantCount.toLocaleString()} participants
              </p>
            </div>
            {isRegistered ? (
              <Button asChild className="shrink-0">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : registrationOpen && isAuthenticated ? (
              <Button asChild className="shrink-0">
                <Link to={`/events/${event.id}/register`}>Register</Link>
              </Button>
            ) : registrationOpen ? (
              <Button className="shrink-0" onClick={openSignIn}>
                Sign in
              </Button>
            ) : (
              <Button className="shrink-0" disabled>
                Closed
              </Button>
            )}
          </div>
        </div>
        <div className="h-20 lg:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  )
}
