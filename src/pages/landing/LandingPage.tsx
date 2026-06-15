import { lazy, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useEvent, useEvents } from '@/hooks'
import { HeroBeamWidthProvider } from '@/components/ui/lamp'
import {
  AboutSection,
  ContactSection,
  FAQSection,
  FEATURED_EVENT_FALLBACK,
  FEATURED_EVENT_ID,
  HeroSection,
  PrizesTracksSection,
  SponsorsSection,
  TimelineSection,
} from '@/features/landing'

const LiveLeaderboardSection = lazy(() =>
  import('@/features/landing/LiveLeaderboardSection').then((m) => ({
    default: m.LiveLeaderboardSection,
  })),
)

function LiveLeaderboardFallback() {
  return (
    <section
      className="section-shell border-t bg-muted/15"
      aria-labelledby="live-leaderboard-heading"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <h2 id="live-leaderboard-heading" className="sr-only">
          Live standings
        </h2>
        <Skeleton className="h-72 w-full rounded-lg" aria-hidden="true" />
      </div>
    </section>
  )
}

export default function LandingPage() {
  usePageMeta({
    title: 'BeetleX Hackathon Platform',
    description:
      'Discover global hackathons, register teams, submit projects, and follow live leaderboards on BeetleX.',
  })

  const { data: featuredEvent, isLoading: featuredLoading } = useEvent(FEATURED_EVENT_ID)
  const { data: activeEvents, isLoading: activeLoading } = useEvents({
    status: 'active',
    limit: 1,
  })

  const queriesLoading = featuredLoading || activeLoading
  const resolvedEvent = featuredEvent ?? activeEvents?.data[0] ?? null
  const isLoading = queriesLoading && !resolvedEvent
  const event = resolvedEvent ?? (!isLoading ? FEATURED_EVENT_FALLBACK : undefined)

  return (
    <HeroBeamWidthProvider>
      <div className="relative">
        <Header overHero />
        <main id="main-content">
          <HeroSection event={event} isLoading={isLoading} />
          <AboutSection />
          <TimelineSection event={event} isLoading={isLoading} />
          <PrizesTracksSection event={event} isLoading={isLoading} />
          <Suspense fallback={<LiveLeaderboardFallback />}>
            <LiveLeaderboardSection />
          </Suspense>
          <SponsorsSection event={event} isLoading={isLoading} />
          <FAQSection event={event} isLoading={isLoading} />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </HeroBeamWidthProvider>
  )
}
