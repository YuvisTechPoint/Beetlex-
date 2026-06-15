import { useEffect, useState } from 'react'
import type { Event } from '@/types'
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
  'border-amber-400/50 bg-amber-500/10',
  'border-slate-400/50 bg-slate-500/10',
  'border-orange-600/40 bg-orange-700/10',
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
      <section id="prizes" className="py-20" aria-labelledby="prizes-heading">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="prizes-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              Tracks & Prizes
            </h2>
            <p className="mt-4 text-muted-foreground">Prize details will be published soon.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="prizes" className="py-20" aria-labelledby="prizes-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="prizes-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Tracks & Prizes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose your track and compete for prizes across multiple categories.
          </p>
        </div>

        <Tabs value={activeTrack} onValueChange={setActiveTrack} className="mt-12">
          <TabsList className="mx-auto flex w-full max-w-2xl flex-wrap justify-center">
            {event.tracks.map((track) => (
              <TabsTrigger key={track.id} value={track.id} className="flex-1 sm:flex-none">
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
                  <p className="text-muted-foreground">{track.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Problem: </span>
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

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {trackPrizes.map((prize, i) => (
                    <Card
                      key={`${prize.trackId}-${prize.rank}`}
                      className={RANK_STYLES[i] ?? 'border-border'}
                    >
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-4xl font-bold">
                          {formatPrize(prize.amount, prize.currency)}
                        </CardTitle>
                        <CardDescription>#{prize.rank} Place</CardDescription>
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
