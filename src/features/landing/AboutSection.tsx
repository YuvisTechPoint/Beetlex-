import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const HIGHLIGHTS = [
  {
    tag: 'Operations',
    title: 'One platform from signup to standings',
    description:
      'Registration, team invites, submissions, judging, and live rankings — without spreadsheets, Discord bots, or a separate Devpost link.',
  },
  {
    tag: 'Organizers',
    title: 'Built for people running the event',
    description:
      'Participant search, targeted announcements, publish controls, and submission review — the tooling operators actually need on event day.',
  },
  {
    tag: 'Competition',
    title: 'Standings that update as scores land',
    description:
      'Rankings move in real time during finals. Participants see movement the moment judges submit — not after someone exports a CSV.',
  },
  {
    tag: 'Builders',
    title: 'Less logistics, more building time',
    description:
      'Clear deadlines, saved drafts, and a dashboard that tells you exactly what is left before the submission window closes.',
  },
] as const

function ScrollDots({
  count,
  active,
  onSelect,
}: {
  count: number
  active: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Why BeetleX highlights">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={active === i}
          aria-label={`Highlight ${i + 1} of ${count}`}
          onClick={() => onSelect(i)}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            active === i ? 'w-8 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40',
          )}
        />
      ))}
    </div>
  )
}

export function AboutSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[index] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [])

  const scrollByDirection = useCallback(
    (direction: -1 | 1) => {
      const next = Math.max(0, Math.min(HIGHLIGHTS.length - 1, activeIndex + direction))
      scrollToIndex(next)
    },
    [activeIndex, scrollToIndex],
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateActive = () => {
      const cards = Array.from(track.children) as HTMLElement[]
      if (cards.length === 0) return

      const trackCenter = track.scrollLeft + track.clientWidth / 2
      let closest = 0
      let closestDistance = Number.POSITIVE_INFINITY

      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(trackCenter - cardCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = i
        }
      })

      setActiveIndex(closest)
    }

    updateActive()
    track.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      track.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [])

  return (
    <section id="about" className="section-shell border-t overflow-hidden" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-label">Why BeetleX</p>
            <h2 id="about-heading" className="text-heading mt-3 text-balance">
              Hackathon ops, without the duct tape
            </h2>
            <p className="text-subtitle mt-4 max-w-sm">
              We run the operational layer so organizers focus on sponsors and mentors, and builders
              focus on shipping.
            </p>

            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => scrollByDirection(-1)}
                disabled={activeIndex === 0}
                aria-label="Previous highlight"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => scrollByDirection(1)}
                disabled={activeIndex === HIGHLIGHTS.length - 1}
                aria-label="Next highlight"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <ScrollDots
                count={HIGHLIGHTS.length}
                active={activeIndex}
                onSelect={scrollToIndex}
              />
            </div>
          </div>

          <div className="relative mt-10 lg:mt-0">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent md:w-12"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent md:w-12"
              aria-hidden="true"
            />

            <div
              ref={trackRef}
              className="about-scroll-track flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-1 md:gap-5"
              aria-label="Why BeetleX highlights"
            >
              {HIGHLIGHTS.map(({ tag, title, description }, index) => {
                const isActive = activeIndex === index

                return (
                  <article
                    key={title}
                    className={cn(
                      'about-scroll-card snap-center shrink-0 select-none',
                      'flex min-h-[16rem] w-[min(88vw,22rem)] flex-col justify-between rounded-lg border p-6 md:min-h-[17rem] md:w-[24rem] md:p-7',
                      'transition-colors duration-200',
                      isActive
                        ? 'border-border bg-surface'
                        : 'border-border/60 bg-surface/60',
                    )}
                  >
                    <div>
                      <span className="text-label text-primary/80">{tag}</span>
                      <span className="mt-4 block font-mono text-3xl font-medium tabular-nums text-muted-foreground/50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight md:text-xl">
                        {title}
                      </h3>
                    </div>
                    <p className="text-meta mt-4 leading-relaxed md:text-sm">{description}</p>
                  </article>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 lg:hidden">
              <p className="text-meta">Swipe to explore</p>
              <ScrollDots
                count={HIGHLIGHTS.length}
                active={activeIndex}
                onSelect={scrollToIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
