import { HelpCircle } from 'lucide-react'
import { SponsorShowcase } from '@/components/shared/SponsorShowcase'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Event } from '@/types'
import type { ShowcaseSponsor } from '@/data/sponsors'

interface EventSponsorsFaqSectionProps {
  faqs: Event['faqs']
  showcaseSponsors: ShowcaseSponsor[]
}

export function EventSponsorsFaqSection({ faqs, showcaseSponsors }: EventSponsorsFaqSectionProps) {
  return (
    <>
      <section>
        <h2 className="mb-6 text-xl font-semibold">Sponsors</h2>
        <SponsorShowcase sponsors={showcaseSponsors} variant="compact" />
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <HelpCircle className="h-5 w-5" />
          FAQ
        </h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  )
}
