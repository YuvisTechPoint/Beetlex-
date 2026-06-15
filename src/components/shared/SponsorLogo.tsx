import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { LOGO_HEIGHT, type SponsorLogoSize } from './sponsorShowcaseConstants'

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
    <div className={cn('relative w-full', LOGO_HEIGHT[size], className)} aria-hidden="true">
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
