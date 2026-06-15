import type { Event } from '@/types'
import { SectionIntro } from '@/components/shared/SectionIntro'
import { SponsorShowcase } from '@/components/shared/SponsorShowcase'
import { resolveShowcaseSponsors } from '@/data/sponsors'

interface SponsorsSectionProps {
  event?: Event
  isLoading?: boolean
}

export function SponsorsSection({ event, isLoading }: SponsorsSectionProps) {
  const sponsors = resolveShowcaseSponsors(event?.sponsors)

  return (
    <section
      id="sponsors"
      className="section-shell border-t"
      aria-labelledby="sponsors-heading"
    >
      <div className="container mx-auto px-4">
        <SectionIntro
          label="Partners"
          title="Supported by teams building the stack"
          accentWords={2}
          headingId="sponsors-heading"
          subtitle="Cloud platforms, AI labs, and developer tools backing builders on BeetleX."
        />

        <div className="mt-10 md:mt-12">
          <SponsorShowcase sponsors={sponsors} isLoading={isLoading} variant="landing" />
        </div>

        <p className="text-meta mx-auto mt-10 max-w-lg text-center">
          Interested in sponsoring?{' '}
          <a
            href="mailto:sponsors@beetlex.dev"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            sponsors@beetlex.dev
          </a>
        </p>
      </div>
    </section>
  )
}
