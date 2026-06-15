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

export function DashboardShell({ activeTab, onTabChange, children }: DashboardShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isSubmitPage = location.pathname === '/dashboard/submit'

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

        <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-8">
          <div className="container mx-auto max-w-6xl px-4 py-6">{children}</div>
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
        aria-label="Mobile dashboard navigation"
      >
        <div className="grid grid-cols-5 gap-0">
          {NAV_ITEMS.filter((item) => item.id !== 'submit').map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id as DashboardTab)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </button>
            )
          })}
          <Link
            to="/dashboard/submit"
            className={cn(
              'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
              isSubmitPage ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span>Submit</span>
          </Link>
        </div>
      </nav>

      <footer className="border-t bg-muted/30 px-4 py-2 pb-safe md:pb-2">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">
          <p className="hidden text-xs text-muted-foreground md:block">
            BeetleX Participant Dashboard
          </p>
          <ConnectionStatus />
        </div>
      </footer>
    </div>
  )
}
