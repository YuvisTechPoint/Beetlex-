import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/store/notificationStore'
import type { DashboardTab, NavItem } from './types'
import { NAV_ITEMS } from './types'

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const showBadge = item.id === 'announcements' && unreadCount > 0

  const content = (
    <>
      <span className="relative">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {showBadge && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
      <span>{item.label}</span>
    </>
  )

  const className = cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-current={active ? 'page' : undefined}>
      {content}
    </button>
  )
}

interface DashboardSidebarProps {
  activeTab: DashboardTab
  isSubmitPage: boolean
  onTabChange: (tab: DashboardTab) => void
  onNavigate: (href: string) => void
}

export function DashboardSidebar({
  activeTab,
  isSubmitPage,
  onTabChange,
  onNavigate,
}: DashboardSidebarProps) {
  return (
    <aside
      className="hidden w-60 shrink-0 border-r bg-card/50 md:block"
      aria-label="Dashboard navigation"
    >
      <nav className="sticky top-14 flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === 'submit' ? isSubmitPage : activeTab === item.id}
            onClick={() => {
              if (item.href) {
                onNavigate(item.href)
              } else if (item.id !== 'submit') {
                onTabChange(item.id)
              }
            }}
          />
        ))}
      </nav>
    </aside>
  )
}
