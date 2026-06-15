import type { ComponentType } from 'react'

export function OverviewStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label">{title}</p>
          <p className="mt-2 font-mono-data text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && <p className="text-meta mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  )
}
