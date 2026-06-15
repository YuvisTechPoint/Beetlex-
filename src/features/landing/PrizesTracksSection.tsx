import { useEffect, useState } from 'react'
import type { Event } from '@/types'
import { SectionIntro } from '@/components/shared/SectionIntro'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PrizesTracksSectionProps {
  event?: Event
  isLoading?: boolean
}

function formatPrize(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const RANK_STYLES = [
  'border-border bg-surface',
  'border-border bg-surface',
  'border-border bg-surface',
]

export function PrizesTracksSection({ event, isLoading }: PrizesTracksSectionProps) {
  const [activeTrack, setActiveTrack] = useState('')

  useEffect(() => {
    if (event?.tracks[0]?.id) {
      setActiveTrack((current) => current || event.tracks[0].id)
    }
  }, [event])

  if (isLoading) {
    return (
      <section id="prizes" className="py-20" aria-labelledby="prizes-heading-loading">
        <div className="container mx-auto px-4">
          <h2 id="prizes-heading-loading" className="sr-only">
            Loading tracks and prizes
          </h2>
          <Skeleton className="mx-auto h-10 w-64" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section id="prizes" className="section-shell" aria-labelledby="prizes-heading">
        <div className="container mx-auto px-4">
          <SectionIntro
            label="Competition"
            title="Tracks & prizes"
            headingId="prizes-heading"
            subtitle="Prize details will be published soon."
          />
        </div>
      </section>
    )
  }

  return (
    <section id="prizes" className="section-shell" aria-labelledby="prizes-heading">
      <div className="container mx-auto px-4">
        <SectionIntro
          label="Competition"
          title="Tracks & prizes"
          headingId="prizes-heading"
          subtitle="Pick a track, read the problem statement, and see what is on the line."
        />

        <Tabs value={activeTrack} onValueChange={setActiveTrack} className="mt-10">
          <TabsList className="mx-auto flex h-auto w-full max-w-4xl flex-wrap justify-center gap-1 bg-transparent p-0">
            {event.tracks.map((track) => (
              <TabsTrigger
                key={track.id}
                value={track.id}
                className="rounded-md border border-transparent data-[state=active]:border-border data-[state=active]:bg-surface"
              >
                {track.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {event.tracks.map((track) => {
            const trackPrizes = event.prizes
              .filter((p) => p.trackId === track.id)
              .sort((a, b) => a.rank - b.rank)

            return (
              <TabsContent key={track.id} value={track.id} className="mt-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-subtitle">{track.description}</p>
                  <p className="text-meta mt-4">
                    <span className="font-medium text-foreground">Problem — </span>
                    {track.problemStatement}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {track.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
                  {trackPrizes.map((prize, i) => (
                    <Card
                      key={`${prize.trackId}-${prize.rank}`}
                      className={RANK_STYLES[i] ?? 'border-border'}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="font-mono-data text-2xl font-semibold tracking-tight">
                          {formatPrize(prize.amount, prize.currency)}
                        </CardTitle>
                        <CardDescription>#{prize.rank} place</CardDescription>
                      </CardHeader>
                      {prize.perks.length > 0 && (
                        <CardContent>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {prize.perks.map((perk) => (
                              <li key={perk}>• {perk}</li>
                            ))}
                          </ul>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </section>
  )
}
