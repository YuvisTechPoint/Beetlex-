import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isQaAutomationMode } from '@/lib/qaMode'
import type { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ROLES: { label: string; role: UserRole | null }[] = [
  { label: 'Guest', role: null },
  { label: 'Participant', role: 'participant' },
  { label: 'Judge', role: 'judge' },
  { label: 'Organizer', role: 'organizer' },
]

export function DevToolbar() {
  const { user, login, logout } = useAuth()
  const [simulateOverload, setSimulateOverload] = useState(
    () => sessionStorage.getItem('beetlex-simulate-overload') === '1',
  )

  if (!isQaAutomationMode()) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-lg',
      )}
      aria-label="Development role switcher"
    >
      <span className="px-2 text-xs font-medium text-muted-foreground">Dev:</span>
      {ROLES.map(({ label, role }) => (
        <Button
          key={label}
          size="sm"
          variant={
            (role === null ? !user : user?.role === role) ? 'default' : 'outline'
          }
          onClick={() => void (role ? login(role) : logout())}
        >
          {label}
        </Button>
      ))}
      <Button
        size="sm"
        variant={simulateOverload ? 'destructive' : 'outline'}
        onClick={() => {
          const next = !simulateOverload
          setSimulateOverload(next)
          sessionStorage.setItem('beetlex-simulate-overload', next ? '1' : '0')
        }}
      >
        Overload
      </Button>
    </div>
  )
}
