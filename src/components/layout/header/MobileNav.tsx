import { Link } from 'react-router-dom'
import { Bug, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NavLinks } from './NavLinks'
import { dashboardLabelForRole, dashboardPathForRole } from './utils'

export function MobileNav() {
  const { user, isAuthenticated } = useAuth()
  const openSignIn = useUiStore((s) => s.openSignIn)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" aria-hidden="true" />
            BeetleX
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
          <NavLinks mobile onNavigate={undefined} />
        </nav>
        {isAuthenticated && user ? (
          <div className="mt-8 border-t pt-6">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Button asChild className="mt-4 w-full" size="sm">
              <Link to={dashboardPathForRole(user.role)}>
                {dashboardLabelForRole(user.role)}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-2 border-t pt-6">
            <Button variant="outline" size="sm" onClick={openSignIn}>
              Sign In
            </Button>
            <Button size="sm" asChild>
              <Link to="/events">Register Now</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
