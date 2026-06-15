import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardDeltaProps {
  delta: number
  className?: string
  showLabel?: boolean
}

export function LeaderboardDelta({ delta, className, showLabel = false }: LeaderboardDeltaProps) {
  if (delta > 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400',
          className,
        )}
      >
        <ArrowUp className="h-3 w-3" aria-hidden="true" />
        {delta}
        {showLabel && <span className="sr-only"> ranks up</span>}
      </span>
    )
  }

  if (delta < 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400',
          className,
        )}
      >
        <ArrowDown className="h-3 w-3" aria-hidden="true" />
        {Math.abs(delta)}
        {showLabel && <span className="sr-only"> ranks down</span>}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <Minus className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">No rank change</span>
    </span>
  )
}
