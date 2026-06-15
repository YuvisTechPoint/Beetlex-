import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useBroadcastAnnouncement } from '@/hooks/useBroadcastAnnouncement'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'
import { ANNOUNCEMENT_PRIORITY_PREVIEW } from './announcementConstants'
import { DEFAULT_EVENT_ID } from '../types'

interface AnnouncementComposeFormProps {
  totalParticipants: number
}

export function AnnouncementComposeForm({ totalParticipants }: AnnouncementComposeFormProps) {
  const broadcastMutation = useBroadcastAnnouncement()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<Announcement['priority']>('info')
  const previewConfig = ANNOUNCEMENT_PRIORITY_PREVIEW[priority]

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }
    try {
      await broadcastMutation.mutateAsync({
        eventId: DEFAULT_EVENT_ID,
        title: title.trim(),
        message: message.trim(),
        priority,
      })
      toast.success(`Announcement broadcast to ${totalParticipants} participants`)
      setTitle('')
      setMessage('')
      setPriority('info')
    } catch {
      toast.error('Failed to broadcast announcement')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ann-message">Message</Label>
            <Textarea
              id="ann-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(v) => setPriority(v as Announcement['priority'])}
              className="flex flex-wrap gap-4"
            >
              {(['info', 'warning', 'urgent'] as const).map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <RadioGroupItem value={p} id={`priority-${p}`} />
                  <Label htmlFor={`priority-${p}`} className="cursor-pointer capitalize">
                    {p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button
            className="w-full"
            onClick={handleBroadcast}
            disabled={broadcastMutation.isPending}
          >
            <Megaphone className="mr-2 h-4 w-4" aria-hidden="true" />
            Broadcast to All Participants
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
                  previewConfig.className,
                )}
              >
                {previewConfig.label}
              </span>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <h4 className="font-medium">{title || 'Announcement title'}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {message || 'Your message will appear here as you type...'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
