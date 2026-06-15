export interface AuditRoute {
  slug: string
  name: string
  path: string
  auth?: 'participant'
  waitFor?: string
}

export const AUDIT_ROUTES: AuditRoute[] = [
  { slug: 'landing', name: 'Landing Page', path: '/' },
  { slug: 'events', name: 'Event Listing', path: '/events' },
  {
    slug: 'events-filtered',
    name: 'Event Listing (filtered)',
    path: '/events?status=active&q=ai',
  },
  {
    slug: 'events-page-2',
    name: 'Event Listing (page 2)',
    path: '/events?page=2',
  },
  {
    slug: 'event-detail',
    name: 'Event Details',
    path: '/events/evt-upcoming-1',
  },
  {
    slug: 'registration',
    name: 'Registration Flow',
    path: '/events/evt-upcoming-1/register',
    auth: 'participant',
  },
]
