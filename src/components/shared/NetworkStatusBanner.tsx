import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()

  if (isOnline) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-0 z-[60] flex items-center justify-center gap-3 border-b border-amber-500/40 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:bg-amber-950/90 dark:text-amber-50"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You are offline. Changes are queued until connection is restored.</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 border-amber-600/40 bg-transparent text-inherit hover:bg-amber-100 dark:hover:bg-amber-900"
        onClick={() => void queryClient.invalidateQueries()}
      >
        Retry sync
      </Button>
    </div>
  )
}
