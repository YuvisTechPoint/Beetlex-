import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/types'

interface EventTracksSectionProps {
  event: Event
  prizesByTrack: Map<string, Event['prizes']>
}

export function EventTracksSection({ event, prizesByTrack }: EventTracksSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Tracks &amp; Prizes</h2>
      <Accordion type="single" collapsible className="w-full">
        {event.tracks.map((track) => {
          const trackPrizes = prizesByTrack.get(track.id) ?? []
          return (
            <AccordionItem key={track.id} value={track.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="min-w-0 flex-1 pr-2 text-left">
                  <p className="break-words font-medium">{track.name}</p>
                  <p className="break-words text-sm font-normal text-muted-foreground">
                    {track.description}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Problem statement</p>
                  <p className="mt-1 text-sm text-muted-foreground">{track.problemStatement}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {track.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
                {trackPrizes.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-medium">Prizes</p>
                    <ul className="space-y-2">
                      {trackPrizes
                        .sort((a, b) => a.rank - b.rank)
                        .map((prize) => (
                          <li key={`${prize.trackId}-${prize.rank}`} className="text-sm">
                            <span className="font-medium">
                              #{prize.rank} — {prize.currency} {prize.amount.toLocaleString()}
                            </span>
                            {prize.perks.length > 0 && (
                              <span className="text-muted-foreground">
                                {' '}
                                · {prize.perks.join(', ')}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}
