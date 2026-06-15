import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { Button } from '@/components/ui/button'
import {
  EventDetailContent,
  EventDetailHero,
  EventDetailSkeleton,
  useEventDetailPage,
} from '@/features/events/detail'

export default function EventDetailPage() {
  const {
    event,
    isLoading,
    isError,
    isRegistered,
    registrationOpen,
    prizePool,
    teamCount,
    shareUrl,
    copyLink,
    prizesByTrack,
    showcaseSponsors,
    isAuthenticated,
    openSignIn,
  } = useEventDetailPage()

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
        <EventDetailHero
          event={event}
          prizePool={prizePool}
          teamCount={teamCount}
          shareUrl={shareUrl}
          onCopyLink={copyLink}
        />
        <EventDetailContent
          event={event}
          prizesByTrack={prizesByTrack}
          showcaseSponsors={showcaseSponsors}
          isRegistered={isRegistered}
          registrationOpen={registrationOpen}
          isAuthenticated={isAuthenticated}
          onSignIn={openSignIn}
        />
      </main>
      <Footer />
    </>
  )
}
