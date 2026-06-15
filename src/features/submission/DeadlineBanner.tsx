import { format } from 'date-fns'
import { Clock, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { URGENT_THRESHOLD_MS } from './constants'
import { pad } from './utils'

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  isExpired: boolean
}

interface DeadlineBannerProps {
  submissionDeadline: string
  countdown: CountdownState
  isDeadlinePassed: boolean
}

export function DeadlineBanner({
  submissionDeadline,
  countdown,
  isDeadlinePassed,
}: DeadlineBannerProps) {
  const isUrgent = !isDeadlinePassed && countdown.totalMs < URGENT_THRESHOLD_MS

  if (isDeadlinePassed) {
    return (
      <Alert variant="destructive" className="mb-6">
        <Lock className="h-4 w-4" />
        <AlertTitle>Submissions are now closed</AlertTitle>
        <AlertDescription>
          Submissions closed on {format(new Date(submissionDeadline), 'PPpp')}.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={cn(
        'mb-6 flex items-center gap-3 rounded-lg border px-4 py-3',
        isUrgent
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-border bg-muted/50',
      )}
      aria-live="polite"
    >
      <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Submission closes in:</p>
        <p
          className={cn(
            'font-mono text-lg font-bold tabular-nums',
            isUrgent && 'text-destructive',
          )}
        >
          {pad(countdown.days * 24 + countdown.hours)}:{pad(countdown.minutes)}:
          {pad(countdown.seconds)}
        </p>
      </div>
    </div>
  )
}
