import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useQueryClient } from '@tanstack/react-query'
import { AlertBanner } from '@/components/shared/AlertBanner'

export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()

  if (isOnline) return null

  return (
    <div className="sticky top-0 z-[60]">
      <AlertBanner
        priority="warning"
        title="You are offline"
        description="Changes are queued until your connection is restored."
        ariaLive="assertive"
        action={{
          label: 'Retry sync',
          onClick: () => void queryClient.invalidateQueries(),
        }}
      />
    </div>
  )
}
