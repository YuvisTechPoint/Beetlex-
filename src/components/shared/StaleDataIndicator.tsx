import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StaleDataIndicatorProps {
  isStale: boolean
  isFetching: boolean
  onRefresh: () => void
  className?: string
}

export function StaleDataIndicator({
  isStale,
  isFetching,
  onRefresh,
  className,
}: StaleDataIndicatorProps) {
  if (!isStale && !isFetching) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} aria-hidden="true" />
      <span>{isFetching ? 'Refreshing data…' : 'Showing cached data — tap to refresh'}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-7 px-2 text-xs"
        disabled={isFetching}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </div>
  )
}
