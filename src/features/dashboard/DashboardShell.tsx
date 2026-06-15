import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils'
import type { DashboardTab } from '@/types'
import { NAV_ITEMS } from './nav'
import { ConnectionStatus } from './ConnectionStatus'
import { DashboardSidebar } from './DashboardSidebar'

interface DashboardShellProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  children: ReactNode
}

const MOBILE_NAV_SHORT: Record<string, string> = {
  overview: 'Home',
  team: 'Team',
  leaderboard: 'Ranks',
  resources: 'Docs',
  announcements: 'News',
}

export function DashboardShell({ activeTab, onTabChange, children }: DashboardShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isSubmitPage = location.pathname === '/dashboard/submit'
  const mobileNavItems = NAV_ITEMS.filter((item) => item.id !== 'submit')

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar
          activeTab={activeTab}
          isSubmitPage={isSubmitPage}
          onTabChange={onTabChange}
          onNavigate={navigate}
        />

        <main id="main-content" className="flex-1 overflow-x-clip overflow-y-auto pb-20 md:pb-8">
          <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">{children}</div>
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 pb-safe backdrop-blur md:hidden"
        aria-label="Mobile dashboard navigation"
      >
        <div className="grid grid-cols-6 gap-0">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id as DashboardTab)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate">
                  {MOBILE_NAV_SHORT[item.id] ?? item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
          <Link
            to="/dashboard/submit"
            className={cn(
              'flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors',
              isSubmitPage ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-label="Submit project"
            aria-current={isSubmitPage ? 'page' : undefined}
          >
            <Send className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Submit</span>
          </Link>
        </div>
      </nav>

      <footer className="hidden border-t bg-muted/30 px-4 py-2 md:block">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-xs text-muted-foreground">BeetleX Participant Dashboard</p>
          <ConnectionStatus />
        </div>
      </footer>
    </div>
  )
}
