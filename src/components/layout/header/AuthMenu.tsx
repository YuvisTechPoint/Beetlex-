import { Link } from 'react-router-dom'
import { CalendarPlus, LayoutDashboard, Loader2, LogOut, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/shared/UserAvatar'
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
import { dashboardLabelForRole, dashboardPathForRole } from './utils'

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
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
          <span className="hidden max-w-[6rem] truncate text-sm font-medium lg:inline xl:max-w-[7rem]">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-1rem)]">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-9 w-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={dashboardPath} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {dashboardLabelForRole(user.role)}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/organize" className="cursor-pointer">
            <Rocket className="mr-2 h-4 w-4" />
            Organize Hackathon
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/organize/create" className="cursor-pointer">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Hackathon
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
