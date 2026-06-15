import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'
import { RegistrationPageShell } from './RegistrationPageShell'
import type { RegistrationPageState } from './useRegistrationPage'

type RegistrationAlreadyRegisteredViewProps = {
  event: Event
  duplicateInfo: RegistrationPageState['duplicateInfo']
  existingRegistration: RegistrationPageState['existingRegistration']
}

export function RegistrationAlreadyRegisteredView({
  event,
  duplicateInfo,
  existingRegistration,
}: RegistrationAlreadyRegisteredViewProps) {
  const code = duplicateInfo?.registrationCode ?? existingRegistration?.registrationCode

  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-lg px-4 py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Already registered</AlertTitle>
          <AlertDescription>
            Looks like you&apos;re already registered for {event.title}.
            {code && (
              <>
                {' '}
                Your registration code is <strong className="font-mono">{code}</strong>.
              </>
            )}
            {duplicateInfo?.teamName && (
              <>
                {' '}
                You&apos;re on team <strong>{duplicateInfo.teamName}</strong>
                {duplicateInfo.trackName ? `, track ${duplicateInfo.trackName}` : ''}.
              </>
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link to="/dashboard">View your dashboard</Link>
          </Button>
          {code && (
            <Button
              variant="outline"
              onClick={() =>
                void navigator.clipboard.writeText(code).then(() => toast.success('Code copied'))
              }
            >
              Share registration
            </Button>
          )}
        </div>
      </main>
    </RegistrationPageShell>
  )
}
