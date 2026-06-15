import { useCountdown } from '@/hooks/useCountdown'

function padCountdown(value: number): string {
  return String(value).padStart(2, '0')
}

export function CountdownTimer({ target, label }: { target: string | Date; label?: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target)

  const liveText = isExpired
    ? 'Registration has closed'
    : `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ]

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>
      {isExpired ? (
        <p className="text-sm font-semibold text-destructive">Closed</p>
      ) : (
        <div className="grid grid-cols-4 gap-2" aria-hidden="true">
          {units.map((unit) => (
            <div key={unit.label} className="rounded-lg border bg-muted/50 px-3 py-2 text-center">
              <div className="text-2xl font-bold tabular-nums">{padCountdown(unit.value)}</div>
              <div className="text-xs text-muted-foreground">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
