import { lazy, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/skeleton'
import { useEvent, useEvents } from '@/hooks'
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
    <section className="border-t bg-muted/20 py-20" aria-hidden="true">
      <div className="container mx-auto px-4">
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </section>
  )
}

export default function LandingPage() {
  const { data: featuredEvent, isLoading: featuredLoading } = useEvent(FEATURED_EVENT_ID)
  const { data: activeEvents, isLoading: activeLoading } = useEvents({
    status: 'active',
    limit: 1,
  })

  const event =
    featuredEvent ?? activeEvents?.data[0] ?? FEATURED_EVENT_FALLBACK
  const isLoading = !event && (featuredLoading || activeLoading)

  return (
    <>
      <Header />
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
    </>
  )
}
