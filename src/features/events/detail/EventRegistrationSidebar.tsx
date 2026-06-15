import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Event } from '@/types'
import { CountdownTimer } from './CountdownTimer'

interface EventRegistrationSidebarProps {
  event: Event
  isRegistered: boolean
  registrationOpen: boolean
  isAuthenticated: boolean
  onSignIn: () => void
}

export function EventRegistrationSidebar({
  event,
  isRegistered,
  registrationOpen,
  isAuthenticated,
  onSignIn,
}: EventRegistrationSidebarProps) {
  return (
    <aside>
      <div className="space-y-4 lg:sticky lg:top-20">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CountdownTimer target={event.registrationClose} label="Registration closes in" />

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
              <Button className="w-full" onClick={onSignIn}>
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
  )
}
