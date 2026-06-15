import { Copy, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Team } from '@/types'

interface TeamOverviewCardProps {
  team: Team
  trackName: string
}

export function TeamOverviewCard({ team, trackName }: TeamOverviewCardProps) {
  const copyInviteCode = async () => {
    const link = `${window.location.origin}/events/${team.eventId}/register?invite=${team.inviteCode}`
    await navigator.clipboard.writeText(link)
    toast.success('Invite link copied to clipboard')
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(team.inviteCode)
    toast.success('Invite code copied')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{team.name}</CardTitle>
            <CardDescription>{trackName}</CardDescription>
          </div>
          <Badge variant="secondary">{team.submissionStatus.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-3 py-1.5 text-sm font-mono">{team.inviteCode}</code>
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy code
          </Button>
          <Button variant="outline" size="sm" onClick={copyInviteCode}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite member
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
