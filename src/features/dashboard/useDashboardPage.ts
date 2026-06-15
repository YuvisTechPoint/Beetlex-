import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DashboardTab } from '@/types'
import { parseTab } from './utils'

export interface DashboardPageState {
  activeTab: DashboardTab
  setActiveTab: (tab: DashboardTab) => void
}

export function useDashboardPage(): DashboardPageState {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(() => parseTab(searchParams.get('tab')), [searchParams])

  const setActiveTab = (tab: DashboardTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return { activeTab, setActiveTab }
}
