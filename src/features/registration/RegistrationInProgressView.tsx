import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'
import { RegistrationPageShell } from './RegistrationPageShell'

type RegistrationInProgressViewProps = {
  event: Event
}

export function RegistrationInProgressView({ event }: RegistrationInProgressViewProps) {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Registration in progress</AlertTitle>
          <AlertDescription>
            Registration is in progress in another tab. Please wait for it to complete, or refresh
            this page in a moment.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="ghost" asChild>
            <Link to={`/events/${event.id}`}>Back to Event</Link>
          </Button>
        </div>
      </main>
    </RegistrationPageShell>
  )
}
