import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { isNavActive } from './utils'

interface NavLinkProps {
  to: string
  label: string
  onNavigate?: () => void
  className?: string
}

export function NavLink({ to, label, onNavigate, className }: NavLinkProps) {
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
