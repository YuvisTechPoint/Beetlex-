import { Skeleton } from '@/components/ui/skeleton'
import { RegistrationPageShell } from './RegistrationPageShell'

export function RegistrationLoadingView() {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </main>
    </RegistrationPageShell>
  )
}
