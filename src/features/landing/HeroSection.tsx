import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Event } from '@/types'
import { calculatePrizePool } from '@/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HeroLightAtmosphere, LampContainer } from '@/components/ui/lamp'
import { useUiStore } from '@/store/uiStore'
import { AnimatedCounter } from './AnimatedCounter'

interface HeroSectionProps {
  event?: Event
  isLoading?: boolean
}

const titleMotion = {
  initial: { opacity: 0.5, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: 0.2, duration: 0.7, ease: 'easeInOut' as const },
}

function formatEventDateRange(event: Event) {
  const open = new Date(event.registrationOpen)
  const close = new Date(event.submissionDeadline)
  const sameYear = open.getFullYear() === close.getFullYear()
  if (sameYear) {
    return `${format(open, 'MMM d')} – ${format(close, 'MMM d, yyyy')}`
  }
  return `${format(open, 'MMM d, yyyy')} – ${format(close, 'MMM d, yyyy')}`
}

function HeroStatsSkeleton() {
  return (
    <div
      className="mt-8 grid w-full max-w-md grid-cols-3 gap-4 sm:mt-12 sm:max-w-2xl sm:gap-8"
      aria-hidden="true"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <Skeleton className="h-8 w-14 sm:h-10 sm:w-20" />
          <Skeleton className="mt-2 h-3 w-16 sm:w-20" />
        </div>
      ))}
    </div>
  )
}

interface HeroContentProps {
  event?: Event
  isLoading?: boolean
  showStats: boolean
  prizePool: number
  participants: number
  trackCount: number
  title: string
  dateLabel: string
  animatedTitle?: boolean
}

function HeroContent({
  event,
  isLoading,
  showStats,
  prizePool,
  participants,
  trackCount,
  title,
  dateLabel,
  animatedTitle = false,
}: HeroContentProps) {
  const titleClasses =
    'mx-auto max-w-4xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl lg:text-7xl'

  const titleWords = title.split(' ')
  const titleInner = isLoading ? (
    'BeetleX Hackathon'
  ) : (
    <>
      {titleWords.slice(0, -1).join(' ')}{' '}
      <span className="bg-gradient-to-r from-orange-500 via-primary to-amber-400 bg-clip-text text-transparent">
        {titleWords.slice(-1).join(' ')}
      </span>
    </>
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
      <Badge
        variant="secondary"
        className="mb-4 border border-primary/20 bg-primary/10 text-primary"
      >
        {isLoading ? 'Loading dates…' : dateLabel}
      </Badge>

      {animatedTitle ? (
        <motion.h1 id="hero-heading" className={titleClasses} {...titleMotion}>
          {titleInner}
        </motion.h1>
      ) : (
        <h1 id="hero-heading" className={titleClasses}>
          {titleInner}
        </h1>
      )}

      <motion.p
        className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl"
        initial={animatedTitle ? { opacity: 0, y: 20 } : false}
        whileInView={animatedTitle ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.6, ease: 'easeInOut' }}
      >
        {isLoading
          ? 'Loading...'
          : (event?.tagline ?? 'Build the next generation of intelligent applications')}
      </motion.p>

      {showStats ? (
        <motion.div
          className="mt-8 grid w-full max-w-md grid-cols-3 gap-4 sm:mt-12 sm:max-w-2xl sm:gap-8 md:max-w-3xl md:gap-12"
          aria-live="polite"
          aria-atomic="true"
          initial={animatedTitle ? { opacity: 0, y: 16 } : false}
          whileInView={animatedTitle ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center text-center">
            <p className="text-xl font-bold text-primary sm:text-3xl md:text-4xl">
              <AnimatedCounter end={participants} />
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-sm">Participants</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <p className="text-xl font-bold text-primary sm:text-3xl md:text-4xl">
              $<AnimatedCounter end={Math.round(prizePool / 1000)} suffix="K+" />
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-sm">Prize Pool</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <p className="text-xl font-bold text-primary sm:text-3xl md:text-4xl">
              <AnimatedCounter end={trackCount} />
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-sm">Tracks</p>
          </div>
        </motion.div>
      ) : (
        <HeroStatsSkeleton />
      )}

      <motion.div
        className="mt-8 flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:gap-4"
        initial={animatedTitle ? { opacity: 0, y: 16 } : false}
        whileInView={animatedTitle ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true }}
        transition={{ delay: 0.55, duration: 0.6, ease: 'easeInOut' }}
      >
        <Button asChild size="lg" className="w-full gap-2 px-8 sm:w-auto">
          <Link to={event ? `/events/${event.id}/register` : '/events'}>
            Register Now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
          <Link to="/events">Browse Events</Link>
        </Button>
      </motion.div>

      <p className="text-meta mx-auto mt-6 max-w-lg text-pretty">
        Teams of 1–4 · Remote-friendly · Judging by category · Live standings during finals
      </p>
    </div>
  )
}

export function HeroSection({ event, isLoading }: HeroSectionProps) {
  const isDark = useUiStore((s) => s.darkMode)
  const showStats = Boolean(event) && !isLoading
  const prizePool = event ? calculatePrizePool(event.prizes) : 0
  const participants = event?.participantCount ?? 0
  const trackCount = event?.tracks.length ?? 0
  const title = event?.title ?? 'BeetleX AI Forge 2026'
  const dateLabel = event ? formatEventDateRange(event) : 'Registration open now'

  const contentProps = {
    event,
    isLoading,
    showStats,
    prizePool,
    participants,
    trackCount,
    title,
    dateLabel,
  }

  return (
    <section className="relative border-b" aria-labelledby="hero-heading">
      {isDark ? (
        <LampContainer>
          <HeroContent {...contentProps} animatedTitle />
        </LampContainer>
      ) : (
        <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center overflow-hidden bg-background">
          <HeroLightAtmosphere />
          <div className="container relative mx-auto flex items-center justify-center px-4 py-24">
            <HeroContent {...contentProps} />
          </div>
        </div>
      )}
    </section>
  )
}
