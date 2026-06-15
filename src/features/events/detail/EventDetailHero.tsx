import { Calendar, Clock, Copy, Share2, Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils'
import type { Event } from '@/types'
import { STATUS_LABELS, STATUS_VARIANTS } from './constants'

interface EventDetailHeroProps {
  event: Event
  prizePool: number
  teamCount: number
  shareUrl: string
  onCopyLink: () => void
}

export function EventDetailHero({
  event,
  prizePool,
  teamCount,
  shareUrl,
  onCopyLink,
}: EventDetailHeroProps) {
  return (
    <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background min-h-[280px] md:min-h-[320px]">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-3 min-h-[28px]">
          <Badge variant={STATUS_VARIANTS[event.status]}>{STATUS_LABELS[event.status]}</Badge>
          <Badge variant="outline">
            <Trophy className="mr-1 h-3 w-3" />${prizePool.toLocaleString()} prize pool
          </Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {event.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{event.tagline}</p>

        <div className="mt-6 grid min-h-[88px] grid-cols-2 gap-4 rounded-lg border bg-card/50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-lg font-bold text-primary">${prizePool.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-lg font-bold">{event.participantCount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Teams</p>
            <p className="text-lg font-bold">~{teamCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tracks</p>
            <p className="text-lg font-bold">{event.tracks.length}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void onCopyLink()}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Reg closes {formatDate(event.registrationClose)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Submit by {formatDate(event.submissionDeadline)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Teams of {event.teamMinSize}–{event.teamMaxSize}
          </span>
        </div>
      </div>
    </section>
  )
}
