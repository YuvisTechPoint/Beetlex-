import { useState } from 'react'
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
import type { Event } from '@/types'
import { CreateTeamFields } from './CreateTeamFields'
import { JoinTeamFields } from './JoinTeamFields'
import { SoloTeamFields } from './SoloTeamFields'
import type { RegistrationFormValues } from './schemas'
import { allowsSoloRegistration } from './teamMode'
import { generateInvitePreview } from './utils'

export interface TeamSetupStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
}

export function TeamSetupStep({ form, event }: TeamSetupStepProps) {
  const teamMode = form.watch('teamMode')
  const teamName = form.watch('teamName') ?? ''
  const [verifying, setVerifying] = useState(false)
  const [verifiedMembers, setVerifiedMembers] = useState<
    { name: string; email: string; role: string }[]
  >([])

  const previewCode =
    teamMode === 'create' && teamName.trim().length >= 3 ? generateInvitePreview(teamName) : null
  const soloAllowed = allowsSoloRegistration(event.teamMinSize)

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Team Setup</h2>
          <p className="text-sm text-muted-foreground">
            {soloAllowed
              ? `Register individually or in a team of up to ${event.teamMaxSize} members.`
              : `Create a new team or join an existing one. Teams must have ${event.teamMinSize}–${event.teamMaxSize} members.`}
          </p>
        </div>

        <FormField
          control={form.control}
          name="teamMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you like to participate?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue('verifiedTeamName', undefined)
                    setVerifiedMembers([])
                  }}
                  value={field.value}
                  className={`grid gap-3 ${soloAllowed ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
                >
                  {soloAllowed && (
                    <FormItem>
                      <FormControl>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="solo" />
                          <div>
                            <p className="font-medium">Register individually</p>
                            <p className="text-sm text-muted-foreground">
                              Compete solo with a personal workspace
                            </p>
                          </div>
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                  <FormItem>
                    <FormControl>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="create" />
                        <div>
                          <p className="font-medium">Create a team</p>
                          <p className="text-sm text-muted-foreground">
                            Start a new team and invite others
                          </p>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="join" />
                        <div>
                          <p className="font-medium">Join a team</p>
                          <p className="text-sm text-muted-foreground">
                            Enter an invite code from your team leader
                          </p>
                        </div>
                      </label>
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {teamMode === 'solo' && <SoloTeamFields />}
        {teamMode === 'create' && <CreateTeamFields form={form} previewCode={previewCode} />}
        {teamMode === 'join' && (
          <JoinTeamFields
            form={form}
            event={event}
            verifying={verifying}
            setVerifying={setVerifying}
            verifiedMembers={verifiedMembers}
            setVerifiedMembers={setVerifiedMembers}
          />
        )}
      </div>
    </Form>
  )
}
