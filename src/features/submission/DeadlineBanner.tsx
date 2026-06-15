import { format } from 'date-fns'
import { AlertBanner } from '@/components/shared/AlertBanner'
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
      <AlertBanner
        contained={false}
        priority="urgent"
        title="Submissions are now closed"
        description={`Submissions closed on ${format(new Date(submissionDeadline), 'PPpp')}.`}
        className="mb-6"
        ariaLive="polite"
      />
    )
  }

  const priority = isUrgent ? 'urgent' : 'info'

  return (
    <AlertBanner
      contained={false}
      priority={priority}
      title="Submission closes in"
      className="mb-6"
      ariaLive="polite"
    >
      <p
        className={cn(
          'font-mono text-base font-bold tabular-nums tracking-tight',
          isUrgent ? 'text-red-800 dark:text-red-200' : 'text-blue-900 dark:text-blue-200',
        )}
      >
        {pad(countdown.days * 24 + countdown.hours)}:{pad(countdown.minutes)}:
        {pad(countdown.seconds)}
      </p>
    </AlertBanner>
  )
}
