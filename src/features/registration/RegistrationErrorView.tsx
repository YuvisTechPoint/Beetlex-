import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RegistrationPageShell } from './RegistrationPageShell'

export function RegistrationErrorView() {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Button asChild className="mt-6">
          <Link to="/events">Browse Events</Link>
        </Button>
      </main>
    </RegistrationPageShell>
  )
}
