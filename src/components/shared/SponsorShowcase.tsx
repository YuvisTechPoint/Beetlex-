import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { ShowcaseSponsor } from '@/data/sponsors'

export type SponsorLogoSize = 'platinum' | 'gold' | 'silver' | 'bronze'

const LOGO_HEIGHT: Record<SponsorLogoSize, string> = {
  platinum: 'h-7 sm:h-8',
  gold: 'h-6 sm:h-7',
  silver: 'h-5 sm:h-6',
  bronze: 'h-4 sm:h-5',
}

const CARD_HEIGHT: Record<SponsorLogoSize, string> = {
  platinum: 'h-20 sm:h-24',
  gold: 'h-[4.5rem] sm:h-20',
  silver: 'h-16 sm:h-[4.5rem]',
  bronze: 'h-14 sm:h-16',
}

const CARD_PADDING: Record<SponsorLogoSize, string> = {
  platinum: 'px-6 py-4',
  gold: 'px-5 py-3.5',
  silver: 'px-4 py-3',
  bronze: 'px-4 py-2.5',
}

const GRID_COLUMNS: Record<SponsorLogoSize, string> = {
  platinum: 'mx-auto max-w-xl grid-cols-2',
  gold: 'mx-auto max-w-4xl grid-cols-2 sm:grid-cols-3',
  silver: 'mx-auto max-w-5xl grid-cols-2 md:grid-cols-4',
  bronze: 'mx-auto max-w-5xl grid-cols-2 sm:grid-cols-4',
}

interface SponsorLogoProps {
  src: string
  name: string
  size: SponsorLogoSize
  className?: string
}

export function SponsorLogo({ src, name, size, className }: SponsorLogoProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    setStatus('loading')
    const image = new Image()
    image.onload = () => setStatus('ready')
    image.onerror = () => setStatus('error')
    image.src = src
    return () => {
      image.onload = null
      image.onerror = null
    }
  }, [src])

  if (status === 'error') {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-md bg-muted/60 text-center font-semibold tracking-tight text-muted-foreground',
          LOGO_HEIGHT[size],
          className,
        )}
        aria-hidden="true"
      >
        <span className="text-xs sm:text-sm">{name}</span>
      </div>
    )
  }

  return (
    <div
      className={cn('relative w-full', LOGO_HEIGHT[size], className)}
      aria-hidden="true"
    >
      {status === 'loading' && (
        <Skeleton className="absolute inset-0 rounded-md" aria-label={`Loading ${name} logo`} />
      )}
      <div
        className={cn(
          'h-full w-full bg-muted-foreground/60 transition-all duration-300 ease-out',
          'group-hover:bg-foreground group-hover:scale-[1.02] group-focus-visible:bg-foreground',
          status === 'loading' && 'opacity-0',
        )}
        style={{
          maskImage: `url("${src}")`,
          WebkitMaskImage: `url("${src}")`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      />
    </div>
  )
}

interface SponsorCardProps {
  sponsor: ShowcaseSponsor
  size: SponsorLogoSize
}

export function SponsorCard({ sponsor, size }: SponsorCardProps) {
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative flex items-center justify-center overflow-hidden rounded-lg border border-border/50',
        'bg-card/30 shadow-none backdrop-blur-sm',
        'transition-colors duration-200',
        'hover:border-primary/30 hover:bg-card/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        CARD_HEIGHT[size],
        CARD_PADDING[size],
      )}
      aria-label={`Visit ${sponsor.name} website (${sponsor.category})`}
    >
      <div className="flex w-full max-w-[72%] items-center justify-center">
        <SponsorLogo src={sponsor.logoUrl} name={sponsor.name} size={size} />
      </div>
      <span className="sr-only">{sponsor.category}</span>
      <ExternalLink
        className="absolute right-2 top-2 h-3 w-3 text-muted-foreground/0 transition-opacity duration-200 group-hover:text-muted-foreground/50 group-focus-visible:text-muted-foreground"
        aria-hidden="true"
      />
    </a>
  )
}

interface SponsorTierRowProps {
  tier: SponsorLogoSize
  label: string
  description: string
  sponsors: ShowcaseSponsor[]
}

export function SponsorTierRow({ tier, label, description, sponsors }: SponsorTierRowProps) {
  return (
    <div className="space-y-4">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-1.5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground/80">
          {sponsors.length} partner{sponsors.length === 1 ? '' : 's'}
        </p>
      </div>
      <div className={cn('grid gap-3 sm:gap-4', GRID_COLUMNS[tier])}>
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} size={tier} />
        ))}
      </div>
    </div>
  )
}

interface SponsorShowcaseProps {
  sponsors: ShowcaseSponsor[]
  isLoading?: boolean
  variant?: 'landing' | 'compact'
  className?: string
}

export function SponsorShowcase({
  sponsors,
  isLoading,
  variant = 'landing',
  className,
}: SponsorShowcaseProps) {
  const grouped = [
    { tier: 'platinum' as const, sponsors: sponsors.filter((s) => s.tier === 'platinum') },
    { tier: 'gold' as const, sponsors: sponsors.filter((s) => s.tier === 'gold') },
    { tier: 'silver' as const, sponsors: sponsors.filter((s) => s.tier === 'silver') },
    { tier: 'bronze' as const, sponsors: sponsors.filter((s) => s.tier === 'bronze') },
  ].filter((g) => g.sponsors.length > 0)

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)} aria-label="Loading sponsors" aria-busy="true">
        {['platinum', 'gold', 'silver'].map((tier) => (
          <div key={tier} className="space-y-3">
            <Skeleton className="mx-auto h-4 w-32" />
            <div
              className={cn(
                'mx-auto grid grid-cols-2 gap-3 sm:gap-4',
                tier === 'platinum' ? 'max-w-xl' : 'max-w-5xl md:grid-cols-4',
              )}
            >
              {Array.from({ length: tier === 'platinum' ? 2 : 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    'w-full rounded-lg',
                    tier === 'platinum' ? 'h-20 sm:h-24' : 'h-16 sm:h-[4.5rem]',
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sponsors.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Sponsor announcements coming soon.
      </p>
    )
  }

  return (
    <div
      className={cn(
        variant === 'landing' ? 'space-y-10 md:space-y-12' : 'space-y-6',
        className,
      )}
    >
      {grouped.map(({ tier, sponsors: tierSponsors }) => (
        <SponsorTierRow
          key={tier}
          tier={tier}
          label={tier.charAt(0).toUpperCase() + tier.slice(1)}
          description={
            tier === 'platinum'
              ? 'Founding partners powering the hackathon ecosystem'
              : tier === 'gold'
                ? 'Strategic partners accelerating builder velocity'
                : tier === 'silver'
                  ? 'Platform partners supporting teams at scale'
                  : 'Community partners backing the next wave of builders'
          }
          sponsors={tierSponsors}
        />
      ))}
    </div>
  )
}
