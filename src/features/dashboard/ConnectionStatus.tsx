import { useLeaderboardStore } from '@/store/leaderboardStore'
import { useWebSocket, MOCK_WS_URL } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, WS_STATUS_CONFIG } from './utils'

export function ConnectionStatus() {
  const connectionMode = useLeaderboardStore((s) => s.connectionMode)
  const config = STATUS_CONFIG[connectionMode]
  const Icon = config.icon
  const { status: wsStatus } = useWebSocket(MOCK_WS_URL, { enabled: true })
  const wsConfig = WS_STATUS_CONFIG[wsStatus]

  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
        aria-label={`Leaderboard connection: ${config.label}`}
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
          Leaderboard
        </span>
        <span className={cn('h-2 w-2 rounded-full', config.dotClass)} aria-hidden="true" />
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{config.label}</span>
      </div>
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
        aria-label={`Simulated platform connection: ${wsConfig.label}`}
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
          Platform (simulated)
        </span>
        <span className={cn('h-2 w-2 rounded-full', wsConfig.dotClass)} aria-hidden="true" />
        <span>{wsConfig.label}</span>
      </div>
    </div>
  )
}
