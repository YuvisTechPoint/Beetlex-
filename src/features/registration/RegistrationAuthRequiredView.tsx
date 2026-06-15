import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event } from '@/types'
import { RegistrationPageShell } from './RegistrationPageShell'

type RegistrationAuthRequiredViewProps = {
  event: Event
}

export function RegistrationAuthRequiredView({ event }: RegistrationAuthRequiredViewProps) {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to register for {event.title}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use the development toolbar at the bottom-left to sign in as a participant, then
              return here to complete registration.
            </p>
            <Button variant="outline" asChild>
              <Link to={`/events/${event.id}`}>Back to Event</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </RegistrationPageShell>
  )
}
