import { EventListingPageContent, useEventListingPage } from '@/features/events'

export default function EventListingPage() {
  return <EventListingPageContent {...useEventListingPage()} />
}
