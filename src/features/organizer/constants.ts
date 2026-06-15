import type { ComponentType } from 'react'
import { ClipboardList, Gavel, LayoutDashboard, Megaphone, Trophy, Users } from 'lucide-react'
import type { OrganizerTab } from '@/types'

export const DEFAULT_EVENT_ID = 'evt-active-1'

export const TABS: {
  id: OrganizerTab
  label: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: ClipboardList },
  { id: 'judges', label: 'Judges', icon: Gavel },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
]
