import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, Code2, Globe, Trophy } from 'lucide-react'
import type { Event } from '@/types'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SponsorShowcase } from '@/components/shared/SponsorShowcase'
import { useEvent, useEvents } from '@/hooks'
import { resolveShowcaseSponsors } from '@/data/sponsors'
import { calculatePrizePool } from '@/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'

const FEATURED_EVENT_ID = 'evt-upcoming-1'

// ---------------------------------------------------------------------------
// AnimatedCounter (inlined from shared)
// ---------------------------------------------------------------------------

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    const startTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [end, duration])

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------

interface HeroSectionProps {
  event?: Event
  isLoading?: boolean
}

function formatEventDateRange(event: Event) {
  const open = new Date(event.registrationOpen)
  const close = new Date(event.submissionDeadline)
  const sameYear = open.getFullYear() === close.getFullYear()
  if (sameYear) {
    return `${format(open, 'MMM d')}–${format(close, 'MMM d, yyyy')}`
  }
  return `${format(open, 'MMM d, yyyy')} – ${format(close, 'MMM d, yyyy')}`
}

function HeroSection({ event, isLoading }: HeroSectionProps) {
  const prizePool = event ? calculatePrizePool(event.prizes) : 125000
  const participants = event?.participantCount ?? 2847
  const trackCount = event?.tracks.length ?? 4
  const title = event?.title ?? 'BeetleX Global Hackathon'
  const dateLabel = event ? formatEventDateRange(event) : 'Registration open now'

  return (
    <section
      className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b bg-gradient-to-b from-indigo-50/80 via-background to-background dark:from-indigo-950/30"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div
        className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            {isLoading ? 'Loading dates…' : dateLabel}
          </Badge>

          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {isLoading ? (
              'BeetleX Hackathon'
            ) : (
              <>
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  {title.split(' ').slice(-1).join(' ')}
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {isLoading
              ? 'Loading...'
              : (event?.tagline ?? 'Build the future of developer tooling')}
          </p>

          <div
            className="mt-12 flex flex-row flex-nowrap items-center justify-center gap-6 sm:gap-10 md:gap-16"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                <AnimatedCounter end={participants} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                $<AnimatedCounter end={Math.round(prizePool / 1000)} suffix="K+" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Prize Pool</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
                <AnimatedCounter end={trackCount} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Tracks</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link to={event ? `/events/${event.id}/register` : '/events'}>
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// AboutSection
// ---------------------------------------------------------------------------

const HIGHLIGHTS = [
  {
    icon: Code2,
    title: 'Build Real Projects',
    description:
      'Ship production-ready prototypes with mentorship from industry engineers and access to cloud credits.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connect with builders worldwide across AI, Web3, DevTools, and more — all on one platform.',
  },
  {
    icon: Trophy,
    title: 'Win Big',
    description:
      'Compete for cash prizes, internship interviews, cloud credits, and fast-track opportunities.',
  },
] as const

function AboutSection() {
  return (
    <section id="about" className="py-20" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="about-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Why <span className="text-primary">BeetleX</span>?
          </h2>
          <p className="mt-4 text-muted-foreground">
            BeetleX is the end-to-end hackathon platform for organizers and participants. From registration
            and team formation to submissions and live judging — we handle the logistics so you can focus on building.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// TimelineSection
// ---------------------------------------------------------------------------

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

function TimelineSection({ event, isLoading }: TimelineSectionProps) {
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

// ---------------------------------------------------------------------------
// PrizesTracksSection
// ---------------------------------------------------------------------------

interface PrizesTracksSectionProps {
  event?: Event
  isLoading?: boolean
}

function formatPrize(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const RANK_STYLES = [
  'border-amber-400/50 bg-amber-500/10',
  'border-slate-400/50 bg-slate-500/10',
  'border-orange-600/40 bg-orange-700/10',
]

function PrizesTracksSection({ event, isLoading }: PrizesTracksSectionProps) {
  const [activeTrack, setActiveTrack] = useState('')

  useEffect(() => {
    if (event?.tracks[0]?.id) {
      setActiveTrack((current) => current || event.tracks[0].id)
    }
  }, [event])

  if (isLoading) {
    return (
      <section id="prizes" className="py-20" aria-labelledby="prizes-heading-loading">
        <div className="container mx-auto px-4">
          <h2 id="prizes-heading-loading" className="sr-only">
            Loading tracks and prizes
          </h2>
          <Skeleton className="mx-auto h-10 w-64" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!event) return null

  return (
    <section id="prizes" className="py-20" aria-labelledby="prizes-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="prizes-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Tracks & Prizes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose your track and compete for prizes across multiple categories.
          </p>
        </div>

        <Tabs value={activeTrack} onValueChange={setActiveTrack} className="mt-12">
          <TabsList className="mx-auto flex w-full max-w-2xl flex-wrap justify-center">
            {event.tracks.map((track) => (
              <TabsTrigger key={track.id} value={track.id} className="flex-1 sm:flex-none">
                {track.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {event.tracks.map((track) => {
            const trackPrizes = event.prizes
              .filter((p) => p.trackId === track.id)
              .sort((a, b) => a.rank - b.rank)

            return (
              <TabsContent key={track.id} value={track.id} className="mt-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-muted-foreground">{track.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Problem: </span>
                    {track.problemStatement}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {track.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {trackPrizes.map((prize, i) => (
                    <Card
                      key={`${prize.trackId}-${prize.rank}`}
                      className={RANK_STYLES[i] ?? 'border-border'}
                    >
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-4xl font-bold">
                          {formatPrize(prize.amount, prize.currency)}
                        </CardTitle>
                        <CardDescription>#{prize.rank} Place</CardDescription>
                      </CardHeader>
                      {prize.perks.length > 0 && (
                        <CardContent>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {prize.perks.map((perk) => (
                              <li key={perk}>• {perk}</li>
                            ))}
                          </ul>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SponsorsSection
// ---------------------------------------------------------------------------

interface SponsorsSectionProps {
  event?: Event
  isLoading?: boolean
}

function SponsorsSection({ event, isLoading }: SponsorsSectionProps) {
  const sponsors = resolveShowcaseSponsors(event?.sponsors)

  return (
    <section
      id="sponsors"
      className="relative overflow-hidden border-t py-20 md:py-28"
      aria-labelledby="sponsors-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-30"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/5 text-primary"
          >
            Ecosystem Partners
          </Badge>
          <h2
            id="sponsors-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            Backed by builders at scale
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            AI labs, cloud platforms, and developer tooling leaders supporting thousands of
            hackers building the next generation of products.
          </p>
        </div>

        <div className="mt-14 md:mt-16">
          <SponsorShowcase sponsors={sponsors} isLoading={isLoading} variant="landing" />
        </div>

        <p className="mx-auto mt-14 max-w-2xl text-center text-xs text-muted-foreground md:text-sm">
          Interested in sponsoring BeetleX?{' '}
          <a
            href="mailto:sponsors@beetlex.dev"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Partner with us
          </a>
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQSection
// ---------------------------------------------------------------------------

const EXTRA_FAQS = [
  {
    question: 'How do I form a team?',
    answer:
      'You can create a new team during registration and share your invite code, or join an existing team with a code from your team leader.',
  },
  {
    question: 'What happens after I register?',
    answer:
      'After registration you get access to the team dashboard where you can manage your team, submit your project, and track announcements.',
  },
]

interface FAQSectionProps {
  event?: Event
  isLoading?: boolean
}

function FAQSection({ event, isLoading }: FAQSectionProps) {
  const [search, setSearch] = useState('')
  const faqs = useMemo(() => [...(event?.faqs ?? []), ...EXTRA_FAQS], [event?.faqs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    )
  }, [faqs, search])

  return (
    <section id="faq" className="py-20" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before registering.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search FAQs"
            className="mb-6"
          />
        </div>

        <div className="mx-auto mt-4 max-w-2xl">
          {isLoading ? (
            <div className="space-y-4" aria-label="Loading FAQs">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground">No FAQs match your search.</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// ContactSection
// ---------------------------------------------------------------------------

function ContactSection() {
  return (
    <section id="contact" className="border-t bg-muted/20 py-20" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="contact-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Get in touch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions about registration, sponsorship, or judging? Our team is here to help.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
              <CardDescription>Hackathon support</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:hello@beetlex.dev"
                className="text-sm font-medium text-primary hover:underline"
              >
                hello@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sponsors</CardTitle>
              <CardDescription>Partnership inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:sponsors@beetlex.dev"
                className="text-sm font-medium text-primary hover:underline"
              >
                sponsors@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discord</CardTitle>
              <CardDescription>Community & mentors</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://discord.gg/beetlex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Join server
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// LandingPage
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const { data: featuredEvent, isLoading: featuredLoading } = useEvent(FEATURED_EVENT_ID)
  const { data: activeEvents, isLoading: activeLoading } = useEvents({
    status: 'active',
    limit: 1,
  })

  const event = featuredEvent ?? activeEvents?.data[0]
  const isLoading = !event && (featuredLoading || activeLoading)

  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection event={event} isLoading={isLoading} />
        <AboutSection />
        <TimelineSection event={event} isLoading={isLoading} />
        <PrizesTracksSection event={event} isLoading={isLoading} />
        <SponsorsSection event={event} isLoading={isLoading} />
        <FAQSection event={event} isLoading={isLoading} />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
