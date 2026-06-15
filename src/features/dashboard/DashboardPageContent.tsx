import { DashboardShell } from './DashboardShell'
import { OverviewTab } from './OverviewTab'
import { TeamTab } from './TeamTab'
import { LeaderboardTab } from './LeaderboardTab'
import { ResourcesTab } from './ResourcesTab'
import { AnnouncementsTab } from './AnnouncementsTab'
import type { DashboardPageState } from './useDashboardPage'

export function DashboardPageContent({ activeTab, setActiveTab }: DashboardPageState) {
  return (
    <DashboardShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'team' && <TeamTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'resources' && <ResourcesTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}
    </DashboardShell>
  )
}
