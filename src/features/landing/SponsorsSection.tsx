import type { Event } from '@/types'
import { SponsorShowcase } from '@/components/shared/SponsorShowcase'
import { resolveShowcaseSponsors } from '@/data/sponsors'
import { Badge } from '@/components/ui/badge'

interface SponsorsSectionProps {
  event?: Event
  isLoading?: boolean
}

export function SponsorsSection({ event, isLoading }: SponsorsSectionProps) {
  const sponsors = resolveShowcaseSponsors(event?.sponsors)

  return (
    <section
      id="sponsors"
      className="relative overflow-hidden border-t py-20 md:py-28"
      aria-labelledby="sponsors-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-30"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/5 text-primary"
          >
            Ecosystem Partners
          </Badge>
          <h2
            id="sponsors-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            Backed by builders at scale
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            AI labs, cloud platforms, and developer tooling leaders supporting thousands of
            hackers building the next generation of products.
          </p>
        </div>

        <div className="mt-14 md:mt-16">
          <SponsorShowcase sponsors={sponsors} isLoading={isLoading} variant="landing" />
        </div>

        <p className="mx-auto mt-14 max-w-2xl text-center text-xs text-muted-foreground md:text-sm">
          Interested in sponsoring BeetleX?{' '}
          <a
            href="mailto:sponsors@beetlex.dev"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Partner with us
          </a>
        </p>
      </div>
    </section>
  )
}
