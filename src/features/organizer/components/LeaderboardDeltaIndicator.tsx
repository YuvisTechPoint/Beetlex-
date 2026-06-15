import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export function LeaderboardDeltaIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <ArrowUp className="h-3 w-3" aria-hidden="true" />
        {delta}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        <ArrowDown className="h-3 w-3" aria-hidden="true" />
        {Math.abs(delta)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" aria-hidden="true" />
    </span>
  )
}
