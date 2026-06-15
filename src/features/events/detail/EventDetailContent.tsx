import type { Event } from '@/types'
import type { ShowcaseSponsor } from '@/data/sponsors'
import { PublicLiveLeaderboard } from '@/components/shared/PublicLiveLeaderboard'
import { LIVE_LEADERBOARD_EVENT_ID } from '@/features/landing/constants'
import { EventAboutTabs } from './EventAboutTabs'
import { EventTracksSection } from './EventTracksSection'
import { EventTimelineSection } from './EventTimelineSection'
import { EventSponsorsFaqSection } from './EventSponsorsFaqSection'
import { EventRegistrationSidebar } from './EventRegistrationSidebar'
import { EventMobileCta } from './EventMobileCta'

interface EventDetailContentProps {
  event: Event
  prizesByTrack: Map<string, Event['prizes']>
  showcaseSponsors: ShowcaseSponsor[]
  isRegistered: boolean
  registrationOpen: boolean
  isAuthenticated: boolean
  onSignIn: () => void
}

export function EventDetailContent({
  event,
  prizesByTrack,
  showcaseSponsors,
  isRegistered,
  registrationOpen,
  isAuthenticated,
  onSignIn,
}: EventDetailContentProps) {
  return (
    <>
      <div className="container mx-auto grid gap-8 px-4 py-6 sm:py-8 lg:grid-cols-3 lg:gap-10">
        <div className="order-2 space-y-8 sm:space-y-10 lg:order-1 lg:col-span-2">
          <EventAboutTabs event={event} />
          <EventTracksSection event={event} prizesByTrack={prizesByTrack} />
          {event.id === LIVE_LEADERBOARD_EVENT_ID && (
            <PublicLiveLeaderboard
              eventId={event.id}
              eventTitle={event.title}
              showDashboardLink={false}
            />
          )}
          <EventTimelineSection timeline={event.timeline} />
          <EventSponsorsFaqSection faqs={event.faqs} showcaseSponsors={showcaseSponsors} />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-1">
          <EventRegistrationSidebar
            event={event}
            isRegistered={isRegistered}
            registrationOpen={registrationOpen}
            isAuthenticated={isAuthenticated}
            onSignIn={onSignIn}
          />
        </div>
      </div>

      <EventMobileCta
        event={event}
        isRegistered={isRegistered}
        registrationOpen={registrationOpen}
        isAuthenticated={isAuthenticated}
        onSignIn={onSignIn}
      />
    </>
  )
}
