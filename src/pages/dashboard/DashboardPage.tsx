import { DashboardPageContent, useDashboardPage } from '@/features/dashboard'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function DashboardPage() {
  usePageMeta({
    title: 'Team Dashboard',
    description: 'Manage your team, track submissions, and follow live leaderboard rankings.',
  })
  return <DashboardPageContent {...useDashboardPage()} />
}
