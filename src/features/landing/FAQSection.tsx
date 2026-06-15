import { useMemo, useState } from 'react'
import type { Event } from '@/types'
import { SectionIntro } from '@/components/shared/SectionIntro'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { EXTRA_FAQS } from './constants'

interface FAQSectionProps {
  event?: Event
  isLoading?: boolean
}

export function FAQSection({ event, isLoading }: FAQSectionProps) {
  const [search, setSearch] = useState('')
  const faqs = useMemo(() => [...(event?.faqs ?? []), ...EXTRA_FAQS], [event?.faqs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    )
  }, [faqs, search])

  return (
    <section id="faq" className="section-shell border-t" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4">
        <SectionIntro
          label="FAQ"
          title="Before you register"
          headingId="faq-heading"
          subtitle="Rules, logistics, and what to expect on event day."
        />

        <div className="mx-auto mt-8 max-w-2xl">
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search FAQs"
            className="mb-6"
          />
        </div>

        <div className="mx-auto mt-4 max-w-2xl">
          {isLoading ? (
            <div className="space-y-4" aria-label="Loading FAQs">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground">No FAQs match your search.</p>
          )}
        </div>
      </div>
    </section>
  )
}
