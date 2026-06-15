import {
  ClipboardList,
  Gavel,
  LayoutDashboard,
  Megaphone,
  Trophy,
  Users,
} from 'lucide-react'

export const DEFAULT_EVENT_ID = 'evt-active-1'

export type OrganizerTab =
  | 'overview'
  | 'participants'
  | 'submissions'
  | 'judges'
  | 'announcements'
  | 'leaderboard'

export const TABS: {
  id: OrganizerTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: ClipboardList },
  { id: 'judges', label: 'Judges', icon: Gavel },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
]
