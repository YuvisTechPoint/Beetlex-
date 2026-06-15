import { DashboardPageContent, useDashboardPage } from '@/features/dashboard'

export default function DashboardPage() {
  return <DashboardPageContent {...useDashboardPage()} />
}
