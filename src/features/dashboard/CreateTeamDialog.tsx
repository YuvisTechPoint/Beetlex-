import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Copy, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ApiClientError } from '@/api/client'
import { generateInvitePreview } from '@/features/registration/utils'
import { useCreateTeam } from '@/hooks/useCreateTeam'
import { useEvents } from '@/hooks/useEvents'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const createTeamSchema = z.object({
  eventId: z.string().min(1, 'Select an event'),
  trackId: z.string().min(1, 'Select a track'),
  teamName: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30, 'Maximum 30 characters')
    .regex(/^[a-zA-Z0-9 ]+$/, 'Letters and numbers only'),
})

type CreateTeamFormValues = z.infer<typeof createTeamSchema>

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { data: eventsResponse, isLoading: eventsLoading } = useEvents({ limit: 50 })
  const createTeamMutation = useCreateTeam()

  const registerableEvents = useMemo(
    () =>
      (eventsResponse?.data ?? []).filter(
        (event) => event.status === 'active' || event.status === 'upcoming',
      ),
    [eventsResponse?.data],
  )

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      eventId: '',
      trackId: '',
      teamName: '',
    },
  })

  const selectedEventId = form.watch('eventId')
  const teamName = form.watch('teamName')
  const selectedEvent = registerableEvents.find((event) => event.id === selectedEventId)
  const previewCode = teamName.trim().length >= 3 ? generateInvitePreview(teamName.trim()) : null

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  useEffect(() => {
    form.setValue('trackId', '')
  }, [selectedEventId, form])

  const copyCode = async () => {
    if (!previewCode) return
    await navigator.clipboard.writeText(previewCode)
    toast.success('Invite code copied')
  }

  const onSubmit = (values: CreateTeamFormValues) => {
    createTeamMutation.mutate(
      {
        eventId: values.eventId,
        trackId: values.trackId,
        teamName: values.teamName.trim(),
      },
      {
        onSuccess: (result) => {
          onOpenChange(false)
          toast.success(`Team "${result.team.name}" created`)
        },
        onError: (error) => {
          const message = error instanceof ApiClientError ? error.message : 'Failed to create team'
          toast.error(message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            Create a team
          </DialogTitle>
          <DialogDescription>
            Start a new team for an event. You will be the team leader and can share the invite code
            with teammates.
          </DialogDescription>
        </DialogHeader>

        {eventsLoading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : registerableEvents.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No open events are available right now. Check back on the events page.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registerableEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              {selectedEvent && (
                <FormField
                  control={form.control}
                  name="trackId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Track *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a track" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedEvent.tracks.map((track) => (
                            <SelectItem key={track.id} value={track.id}>
                              {track.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Quantum Coders" maxLength={30} {...field} />
                    </FormControl>
                    <FormDescription>3–30 characters, letters and numbers only</FormDescription>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              {previewCode && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Generated invite code</p>
                    <p className="font-mono text-lg font-semibold">{previewCode}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyCode()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTeamMutation.isPending}>
                  {createTeamMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Create team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
