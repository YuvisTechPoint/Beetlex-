import type { ComponentType } from 'react'
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  Send,
  Trophy,
  Users,
} from 'lucide-react'

export type DashboardTab = 'overview' | 'team' | 'leaderboard' | 'resources' | 'announcements'

export const VALID_TABS: DashboardTab[] = [
  'overview',
  'team',
  'leaderboard',
  'resources',
  'announcements',
]

export interface NavItem {
  id: DashboardTab | 'submit'
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'team', label: 'My Team', icon: Users },
  { id: 'submit', label: 'Submit Project', icon: Send, href: '/dashboard/submit' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'announcements', label: 'Announcements', icon: Bell },
]
