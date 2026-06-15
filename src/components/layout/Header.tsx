import { createElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Bug,
  Clock,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Sun,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { SignInDialog } from '@/components/layout/SignInDialog'
import { useNotificationStore } from '@/store/notificationStore'
import { useNotificationSync } from '@/hooks/useNotificationSync'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { UrgentBanner } from '@/components/layout/UrgentBanner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Notification, UserRole } from '@/types'

const NAV_LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/#about', label: 'About' },
  { to: '/#faq', label: 'FAQ' },
  { to: '/#contact', label: 'Contact' },
] as const

const PRIORITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  urgent: AlertOctagon,
} as const

const PRIORITY_STYLES = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
} as const

function userInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function dashboardPathForRole(role: UserRole) {
  if (role === 'judge') return '/judge'
  if (role === 'organizer') return '/organizer'
  return '/dashboard'
}

function dashboardLabelForRole(role: UserRole) {
  if (role === 'judge') return 'Judge Panel'
  if (role === 'organizer') return 'Organizer Hub'
  return 'Dashboard'
}

function isNavActive(to: string, pathname: string, hash: string) {
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1)
  }
  if (to === '/events') {
    return pathname === '/events' || pathname.startsWith('/events/')
  }
  return pathname === to
}

const TYPE_ICONS = {
  announcement: Info,
  score_update: Trophy,
  deadline_alert: Clock,
  system: Bell,
} as const

function notificationIcon(notification: Notification) {
  if (notification.type in TYPE_ICONS) {
    return TYPE_ICONS[notification.type as keyof typeof TYPE_ICONS]
  }
  return PRIORITY_ICONS[notification.priority]
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification
  onRead: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={cn(
        'flex w-full gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
        !notification.read && 'bg-muted/50',
      )}
    >
      {createElement(notificationIcon(notification), {
        className: cn('mt-0.5 h-4 w-4 shrink-0', PRIORITY_STYLES[notification.priority]),
        'aria-hidden': true,
      })}
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium leading-snug', !notification.read && 'text-foreground')}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <time
          className="mt-1 block text-[10px] text-muted-foreground"
          dateTime={notification.createdAt}
        >
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </time>
      </div>
      {!notification.read && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
      )}
    </button>
  )
}

function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const { markAsRead, markAllAsRead } = useNotificationActions()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell className="h-[1.125rem] w-[1.125rem]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="space-y-0.5" role="list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} onRead={markAsRead} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DarkModeToggle() {
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun className="h-[1.125rem] w-[1.125rem]" /> : <Moon className="h-[1.125rem] w-[1.125rem]" />}
    </Button>
  )
}

function NavLink({
  to,
  label,
  onNavigate,
  className,
}: {
  to: string
  label: string
  onNavigate?: () => void
  className?: string
}) {
  const { pathname, hash } = useLocation()
  const active = isNavActive(to, pathname, hash)

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/12 text-primary'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        className,
      )}
    >
      {label}
    </Link>
  )
}

function NavLinks({
  onNavigate,
  mobile,
  className,
}: {
  onNavigate?: () => void
  mobile?: boolean
  className?: string
}) {
  const { user } = useAuth()

  return (
    <div className={cn(mobile ? 'flex flex-col gap-1' : 'flex items-center gap-0.5', className)}>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          label={link.label}
          onNavigate={onNavigate}
          className={mobile ? 'w-full rounded-lg px-3 py-2.5 text-left' : undefined}
        />
      ))}
      {user?.role === 'organizer' && (
        <NavLink
          to="/organizer"
          label="Organizer"
          onNavigate={onNavigate}
          className={mobile ? 'w-full rounded-lg px-3 py-2.5 text-left' : undefined}
        />
      )}
    </div>
  )
}

function UserMenu() {
  const { user, logout, isLoading } = useAuth()
  if (!user) return null

  const dashboardPath = dashboardPathForRole(user.role)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-full px-2 pl-1.5 pr-2.5 hover:bg-muted/80"
          aria-label="Account menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {userInitials(user.name)}
          </span>
          <span className="hidden max-w-[7rem] truncate text-sm font-medium md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={dashboardPath} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {dashboardLabelForRole(user.role)}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoading}
          onClick={() => void handleLogout()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const signInOpen = useUiStore((s) => s.signInOpen)
  const openSignIn = useUiStore((s) => s.openSignIn)
  const setSignInOpen = useUiStore((s) => s.setSignInOpen)

  useNotificationSync()

  return (
    <div className="sticky top-0 z-50">
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
      <UrgentBanner />
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          {/* Brand + mobile menu */}
          <div className="flex shrink-0 items-center gap-2">
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

            <Link
              to="/"
              className="group flex items-center gap-2.5 rounded-lg py-1 pr-2 transition-colors hover:text-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Bug className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold tracking-tight">BeetleX</span>
            </Link>
          </div>

          {/* Desktop nav — centered */}
          <nav className="hidden flex-1 justify-center md:flex" aria-label="Main navigation">
            <NavLinks />
          </nav>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <div className="flex items-center">
              <DarkModeToggle />
              {isAuthenticated && <NotificationBell />}
            </div>

            {isAuthenticated && user ? (
              <>
                <Button
                  size="sm"
                  asChild
                  className="hidden h-9 rounded-full px-4 sm:inline-flex"
                >
                  <Link to={dashboardPathForRole(user.role)}>
                    {dashboardLabelForRole(user.role)}
                  </Link>
                </Button>
                <UserMenu />
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
        </div>
      </header>
    </div>
  )
}
