import { memo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Trophy, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { calculatePrizePool } from '@/utils'
import type { Event } from '@/types'
import { STATUS_STYLES } from './constants'
import { getAvatarInitials } from './utils'

interface EventCardProps {
  event: Event
  recommended?: boolean
}

export const EventCard = memo(function EventCard({ event, recommended }: EventCardProps) {
  const prizePool = calculatePrizePool(event.prizes)
  const teamCount = Math.floor(
    event.participantCount / ((event.teamMinSize + event.teamMaxSize) / 2),
  )

  return (
    <Card
      className={cn(
        'flex flex-col transition-colors duration-150 hover:border-border',
        recommended && 'border-primary/30',
      )}
    >
      {recommended && (
        <div className="border-b border-border/60 bg-muted/40 px-4 py-1.5 text-center text-xs font-medium text-muted-foreground">
          Recommended for you
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
          <Badge
            variant="outline"
            className={cn('shrink-0 capitalize', STATUS_STYLES[event.status])}
          >
            {event.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{event.tagline}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {event.tracks.slice(0, 3).map((track) => (
            <Badge key={track.id} variant="secondary" className="text-xs">
              {track.name}
            </Badge>
          ))}
          {event.tracks.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{event.tracks.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
            Reg closes {format(new Date(event.registrationClose), 'MMM d')} · Submit{' '}
            {format(new Date(event.submissionDeadline), 'MMM d')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />$
            {prizePool.toLocaleString()} prize pool
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[10px]">{getAvatarInitials(i)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {event.participantCount} participants · ~{teamCount} teams
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
        {event.status !== 'closed' && (
          <Button asChild className="flex-1">
            <Link to={`/events/${event.id}/register`}>Register</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border p-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}
