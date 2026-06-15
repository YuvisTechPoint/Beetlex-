import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const DEMO_ACCOUNTS: {
  role: UserRole
  label: string
  name: string
  email: string
  description: string
}[] = [
  {
    role: 'participant',
    label: 'Participant',
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    description: 'Register, join teams, submit projects',
  },
  {
    role: 'judge',
    label: 'Judge',
    name: 'Dr. Ananya Rao',
    email: 'ananya.rao@techventures.com',
    description: 'Score submissions and manage review queue',
  },
  {
    role: 'organizer',
    label: 'Organizer',
    name: 'Priya Sharma',
    email: 'priya.sharma@beetlex.io',
    description: 'Manage events, participants, and leaderboard',
  },
]

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const { login, loginWithGoogle, isLoading, error, isGoogleSignInEnabled } = useAuth()
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)
  const [googlePending, setGooglePending] = useState(false)

  const handleSignIn = async (role: UserRole) => {
    setPendingRole(role)
    try {
      await login(role)
      toast.success(`Signed in as ${DEMO_ACCOUNTS.find((a) => a.role === role)?.name ?? 'user'}`)
      onOpenChange(false)
    } catch {
      // error surfaced via store
    } finally {
      setPendingRole(null)
    }
  }

  const handleGoogleSignIn = async () => {
    setGooglePending(true)
    try {
      await loginWithGoogle()
      toast.success('Signed in with Google')
      onOpenChange(false)
    } catch {
      // error surfaced via store
    } finally {
      setGooglePending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to BeetleX</DialogTitle>
          <DialogDescription>
            Sign in with Google or choose a demo account for testing. Sessions sync across tabs.
          </DialogDescription>
        </DialogHeader>

        {isGoogleSignInEnabled && (
          <div className="space-y-4 pt-2">
            <GoogleSignInButton
              loading={googlePending}
              disabled={isLoading && !googlePending}
              onClick={() => void handleGoogleSignIn()}
            />
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or demo as
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              disabled={isLoading}
              onClick={() => void handleSignIn(account.role)}
              className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-colors hover:border-primary/40 hover:bg-card disabled:opacity-60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {account.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{account.label}</span>
                  {pendingRole === account.role && isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{account.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {account.description}
                </span>
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
