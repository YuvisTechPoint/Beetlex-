import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionIntroProps {
  label?: string
  title: string
  subtitle?: ReactNode
  headingId?: string
  className?: string
  /** How many trailing title words receive the brand gradient (default: 1). */
  accentWords?: number
}

function GradientTitle({
  title,
  accentWords = 1,
  id,
  className,
}: {
  title: string
  accentWords?: number
  id?: string
  className?: string
}) {
  const words = title.trim().split(/\s+/)
  const accentCount = Math.min(Math.max(accentWords, 1), words.length)
  const lead = words.slice(0, -accentCount).join(' ')
  const accent = words.slice(-accentCount).join(' ')

  if (words.length <= accentCount) {
    return (
      <h2 id={id} className={cn('text-heading text-heading-gradient', className)}>
        {title}
      </h2>
    )
  }

  return (
    <h2 id={id} className={cn('text-heading', className)}>
      {lead}{' '}
      <span className="text-heading-gradient">{accent}</span>
    </h2>
  )
}

export function SectionIntro({
  label,
  title,
  subtitle,
  headingId,
  className,
  accentWords = 1,
}: SectionIntroProps) {
  return (
    <div className={cn('section-intro text-center', className)}>
      {label ? <p className="text-label-accent">{label}</p> : null}
      <GradientTitle
        title={title}
        accentWords={accentWords}
        id={headingId}
        className={label ? 'mt-3' : undefined}
      />
      {subtitle ? <div className="text-subtitle mx-auto mt-3 max-w-lg">{subtitle}</div> : null}
    </div>
  )
}

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-heading-gradient font-semibold', className)}>{children}</span>
}
