import { cn } from '@/lib/utils'

interface BeetleLogoProps {
  className?: string
  iconClassName?: string
  showText?: boolean
}

export function BeetleLogo({ className, iconClassName, showText = true }: BeetleLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-8 w-8', iconClassName)}
        aria-hidden="true"
      >
        <ellipse cx="16" cy="18" rx="10" ry="8" className="fill-primary" />
        <ellipse cx="16" cy="12" rx="6" ry="5" className="fill-primary/80" />
        <circle cx="12" cy="10" r="1.5" className="fill-primary-foreground" />
        <circle cx="20" cy="10" r="1.5" className="fill-primary-foreground" />
        <path
          d="M6 16C4 14 3 11 4 9M26 16C28 14 29 11 28 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M8 22L4 26M24 22L28 26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-primary/70"
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          Beetle<span className="text-primary">X</span>
        </span>
      )}
    </span>
  )
}
