import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'
import { RegistrationPageShell } from './RegistrationPageShell'

type RegistrationClosedViewProps = {
  event: Event
}

export function RegistrationClosedView({ event }: RegistrationClosedViewProps) {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Registration closed</h1>
        <p className="mt-2 text-muted-foreground">
          Registration for {event.title} is no longer open.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link to={`/events/${event.id}`}>Back to Event</Link>
        </Button>
      </main>
    </RegistrationPageShell>
  )
}
