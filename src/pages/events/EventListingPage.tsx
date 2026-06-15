import { EventListingPageContent, useEventListingPage } from '@/features/events'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function EventListingPage() {
  usePageMeta({
    title: 'Hackathon Events',
    description: 'Browse upcoming, active, and past BeetleX hackathons with filters and search.',
  })
  return <EventListingPageContent {...useEventListingPage()} />
}
