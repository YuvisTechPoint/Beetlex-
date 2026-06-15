import { Wifi, WifiOff } from 'lucide-react'
import type { LeaderboardConnectionMode } from '@/store/leaderboardStore'
import type { WebSocketStatus } from '@/hooks/useWebSocket'
import type { DashboardTab } from './types'
import { VALID_TABS } from './types'

export const STATUS_CONFIG: Record<
  LeaderboardConnectionMode,
  { label: string; dotClass: string; icon: typeof Wifi }
> = {
  connecting: { label: 'Connecting…', dotClass: 'bg-amber-500 animate-pulse', icon: Wifi },
  live: { label: 'Live', dotClass: 'bg-emerald-500', icon: Wifi },
  degraded: { label: 'Updating every 10s', dotClass: 'bg-amber-500', icon: WifiOff },
  disconnected: { label: 'Disconnected', dotClass: 'bg-red-500', icon: WifiOff },
}

export const MODE_LABELS: Record<LeaderboardConnectionMode, string> = {
  live: 'Live',
  degraded: 'Updating every 10s',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
}

export const WS_STATUS_CONFIG: Record<WebSocketStatus, { label: string; dotClass: string }> = {
  connecting: { label: 'Platform connecting…', dotClass: 'bg-amber-500 animate-pulse' },
  connected: { label: 'Platform live', dotClass: 'bg-emerald-500' },
  disconnected: { label: 'Platform offline', dotClass: 'bg-red-500' },
}

export function parseTab(value: string | null): DashboardTab {
  if (value && VALID_TABS.includes(value as DashboardTab)) {
    return value as DashboardTab
  }
  return 'overview'
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
