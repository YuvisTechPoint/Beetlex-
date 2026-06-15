import { Link } from 'react-router-dom'
import { LayoutDashboard, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dashboardLabelForRole, dashboardPathForRole, userInitials } from './utils'

export function AuthMenu() {
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
          <span className="hidden max-w-[7rem] truncate text-sm font-medium md:inline">
            {user.name}
          </span>
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
