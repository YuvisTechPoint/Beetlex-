import { Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Button } from '@/components/ui/button'
import type { DashboardTab, NavItem } from '@/types'
import { NAV_ITEMS } from './nav'

function NavButton({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const showBadge = item.id === 'announcements' && unreadCount > 0

  const content = (
    <>
      <span className="relative shrink-0">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {showBadge && (
          <span
            className={cn(
              'absolute flex items-center justify-center rounded-full bg-destructive font-bold text-destructive-foreground',
              collapsed
                ? '-right-1 -top-1 h-3.5 w-3.5 text-[8px]'
                : '-right-1.5 -top-1.5 h-4 w-4 text-[10px]',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  const className = cn(
    'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className} title={collapsed ? item.label : undefined}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
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
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r bg-card/50 transition-[width] duration-200 ease-in-out md:block',
        sidebarOpen ? 'w-60' : 'w-[4.25rem]',
      )}
      aria-label="Dashboard navigation"
      aria-expanded={sidebarOpen}
    >
      <nav className="sticky top-[var(--site-header-height,3.5rem)] flex h-[calc(100vh-var(--site-header-height,3.5rem))] flex-col p-3">
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              collapsed={!sidebarOpen}
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
        </div>

        <Button
          type="button"
          variant="ghost"
          size={sidebarOpen ? 'sm' : 'icon'}
          onClick={toggleSidebar}
          className={cn(
            'mt-2 shrink-0 text-muted-foreground',
            sidebarOpen ? 'w-full justify-start gap-2 px-3' : 'mx-auto h-9 w-9',
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-sm">Collapse</span>
            </>
          ) : (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </nav>
    </aside>
  )
}
