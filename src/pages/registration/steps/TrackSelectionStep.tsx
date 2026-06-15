import type { UseFormReturn } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import type { RegistrationFormValues } from '@/pages/registration/schemas'
import type { Event } from '@/types'

interface TrackSelectionStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
}

export function TrackSelectionStep({ form, event }: TrackSelectionStepProps) {
  const teamMode = form.watch('teamMode')

  if (teamMode === 'join') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Track Selection</h2>
          <p className="text-sm text-muted-foreground">
            When joining a team, your track is assigned by the team leader. You can view available
            tracks below for reference.
          </p>
        </div>
        <div className="space-y-3">
          {event.tracks.map((track) => (
            <div key={track.id} className="rounded-lg border p-4">
              <p className="font-medium">{track.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Choose Your Track</h2>
          <p className="text-sm text-muted-foreground">
            Select the challenge track your team will compete in.
          </p>
        </div>

        <FormField
          control={form.control}
          name="trackId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Track</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  className="space-y-3"
                >
                  {event.tracks.map((track) => (
                    <FormItem key={track.id}>
                      <FormControl>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value={track.id} className="mt-1" />
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{track.name}</p>
                              {track.techStack.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{track.description}</p>
                            <details className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer text-primary hover:underline">
                                View full problem statement
                              </summary>
                              <p className="mt-2">{track.problemStatement}</p>
                            </details>
                          </div>
                        </label>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
