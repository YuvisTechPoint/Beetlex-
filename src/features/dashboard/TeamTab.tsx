import { useState } from 'react'
import { format } from 'date-fns'
import { Crown, LogOut, UserMinus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEvent } from '@/hooks/useEvent'
import { useMyTeam } from '@/hooks/useMyTeam'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from './utils'
import { TeamOverviewCard } from './TeamOverviewCard'
import { TeamManagementDialog } from './TeamManagementDialog'

export function TeamTab() {
  const { user } = useAuth()
  const { data: team, isLoading } = useMyTeam()
  const { data: event } = useEvent(team?.eventId)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const isLeader = team?.members.some((m) => m.userId === user?.id && m.role === 'leader')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No team found</CardTitle>
          <CardDescription>Register for an event or join a team with an invite code.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const trackName = event?.tracks.find((t) => t.id === team.trackId)?.name ?? 'Unknown track'

  return (
    <div className="space-y-6">
      <TeamOverviewCard team={team} trackName={trackName} />

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {team.members.length} of {event?.teamMaxSize ?? 4} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y" role="list">
            {team.members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'leader' ? 'default' : 'outline'}>
                    {member.role === 'leader' && <Crown className="mr-1 h-3 w-3" aria-hidden="true" />}
                    {member.role}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </span>
                  {isLeader && member.role !== 'leader' && member.userId !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRemoveTarget(member.userId)}
                      aria-label={`Remove ${member.name}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="text-destructive" onClick={() => setLeaveOpen(true)}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Leave team
        </Button>
      </div>

      <TeamManagementDialog
        leaveOpen={leaveOpen}
        removeTarget={removeTarget}
        onLeaveOpenChange={setLeaveOpen}
        onRemoveTargetChange={setRemoveTarget}
      />
    </div>
  )
}
