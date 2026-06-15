import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { AuthMenu } from './AuthMenu'
import { DarkModeToggle } from './DarkModeToggle'
import { NotificationBell } from './NotificationBell'
import { dashboardLabelForRole, dashboardPathForRole } from './utils'

export function HeaderActions() {
  const { user, isAuthenticated } = useAuth()
  const openSignIn = useUiStore((s) => s.openSignIn)

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
      <div className="flex items-center">
        <DarkModeToggle />
        {isAuthenticated && <NotificationBell />}
      </div>

      {isAuthenticated && user ? (
        <>
          <Button size="sm" asChild className="hidden h-9 rounded-full px-4 sm:inline-flex">
            <Link to={dashboardPathForRole(user.role)}>{dashboardLabelForRole(user.role)}</Link>
          </Button>
          <AuthMenu />
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-9 sm:inline-flex"
            onClick={openSignIn}
          >
            Sign In
          </Button>
          <Button size="sm" asChild className="h-9 rounded-full px-4">
            <Link to="/events">Register Now</Link>
          </Button>
        </>
      )}
    </div>
  )
}
