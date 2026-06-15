import { CheckCircle2, Copy, Share2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event } from '@/types'

export interface RegistrationResult {
  registrationId?: string
  registrationCode?: string
  inviteCode?: string
  teamName?: string
  trackName?: string
  mode: 'create' | 'join'
}

interface RegistrationConfirmationProps {
  event: Event
  result: RegistrationResult
}

export function RegistrationConfirmation({ event, result }: RegistrationConfirmationProps) {
  const inviteLink = `${window.location.origin}/events/${event.id}/register?code=${result.inviteCode ?? ''}`
  const shareText = `I just registered for BeetleX Hackathon! Join my team: ${inviteLink}`

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-bounce-once rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-10 w-10 text-primary animate-pulse" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">You&apos;re registered!</h1>
        <p className="text-muted-foreground">
          Welcome to <span className="font-medium text-foreground">{event.title}</span>. Save your
          codes below and invite teammates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration details</CardTitle>
          <CardDescription>
            {result.mode === 'create'
              ? 'Share your invite code with teammates.'
              : 'You have joined your team successfully.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          {result.registrationCode && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Registration ID</p>
                <p className="font-mono font-semibold">{result.registrationCode}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(result.registrationCode!, 'Registration code')}
                aria-label="Copy registration code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {result.inviteCode && result.mode === 'create' && (
            <>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Team invite code</p>
                  <p className="font-mono font-semibold">{result.inviteCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(result.inviteCode!, 'Invite code')}
                  aria-label="Copy invite code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs text-muted-foreground">Team invite link</p>
                  <p className="truncate font-mono text-sm">{inviteLink}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(inviteLink, 'Invite link')}
                  aria-label="Copy invite link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {result.teamName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                Team: <strong>{result.teamName}</strong>
              </span>
            </div>
          )}

          {result.trackName && (
            <p className="text-sm text-muted-foreground">
              Track: <span className="text-foreground">{result.trackName}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm">
        <p className="font-medium">Share your registration</p>
        <p className="mt-1 text-muted-foreground">{shareText}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareTwitter}>
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={shareWhatsApp}>
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(shareText, 'Share text')}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Copy text
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/events/${event.id}`}>Back to Event</Link>
        </Button>
      </div>
    </div>
  )
}
