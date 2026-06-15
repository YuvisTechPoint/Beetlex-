import { useCallback, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ALERT_BANNER_LABELS,
  ALERT_BANNER_STYLES,
  type AlertBannerPriority,
} from './alertBannerStyles'

export interface AlertBannerProps {
  priority: AlertBannerPriority
  title: string
  description?: string
  children?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  /** When false, skips outer container padding (e.g. embedded in a card). */
  contained?: boolean
  /** Full-width bar flush with a parent header (no rounded corners or outer shell). */
  flush?: boolean
  ariaLive?: 'polite' | 'assertive'
}

const EXIT_MS = 220

export function AlertBanner({
  priority,
  title,
  description,
  children,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  action,
  className,
  contained = true,
  flush = false,
  ariaLive = priority === 'urgent' ? 'assertive' : 'polite',
}: AlertBannerProps) {
  const [closing, setClosing] = useState(false)
  const styles = ALERT_BANNER_STYLES[priority]
  const Icon = styles.icon

  const handleDismiss = useCallback(() => {
    if (!onDismiss) return
    setClosing(true)
    window.setTimeout(() => onDismiss(), EXIT_MS)
  }, [onDismiss])

  const alert = (
    <div
      role="alert"
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5',
        flush
          ? cn('rounded-none border-x-0 border-t-0', styles.container)
          : cn('items-start rounded-lg border px-3 py-2 sm:items-center sm:py-2.5', styles.container),
        closing ? 'alert-banner-exit' : 'alert-banner-enter',
        className,
      )}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', flush ? styles.iconClass : cn('mt-0.5 sm:mt-0', styles.iconClass))}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className={cn('text-sm font-semibold leading-snug tracking-tight', styles.title)}>
          <span className="sr-only">{ALERT_BANNER_LABELS[priority]}: </span>
          {title}
        </p>
        {description && (
          <p className={cn('text-sm leading-snug', styles.description)}>{description}</p>
        )}
        {children}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {action && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2 text-xs font-medium', styles.action)}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7 shrink-0', styles.dismiss)}
            onClick={handleDismiss}
            aria-label={dismissLabel}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )

  if (flush) {
    return alert
  }

  if (!contained) {
    return alert
  }

  return (
    <div className="w-full border-b border-border/40 bg-background/95 px-4 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto max-w-6xl">{alert}</div>
    </div>
  )
}
