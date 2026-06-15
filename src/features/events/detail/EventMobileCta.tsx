import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'

interface EventMobileCtaProps {
  event: Event
  isRegistered: boolean
  registrationOpen: boolean
  isAuthenticated: boolean
  onSignIn: () => void
}

export function EventMobileCta({
  event,
  isRegistered,
  registrationOpen,
  isAuthenticated,
  onSignIn,
}: EventMobileCtaProps) {
  return (
    <>
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
            <Button className="shrink-0" onClick={onSignIn}>
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
    </>
  )
}
