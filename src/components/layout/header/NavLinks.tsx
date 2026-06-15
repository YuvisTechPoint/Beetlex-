import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from './constants'
import { NavLink } from './NavLink'

interface NavLinksProps {
  onNavigate?: () => void
  mobile?: boolean
  className?: string
}

export function NavLinks({ onNavigate, mobile, className }: NavLinksProps) {
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
