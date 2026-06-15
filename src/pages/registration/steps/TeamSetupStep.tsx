import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Copy, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { verifyInviteCode } from '@/api/registrations'
import { ApiClientError } from '@/api/client'
import {
  generateInvitePreview,
  type RegistrationFormValues,
} from '@/pages/registration/schemas'
import type { Event } from '@/types'

interface TeamSetupStepProps {
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
    teamMode === 'create' && teamName.trim().length >= 3
      ? generateInvitePreview(teamName)
      : null

  const handleVerifyCode = async () => {
    const code = form.getValues('inviteCode')?.trim()
    if (!code) {
      form.setError('inviteCode', { message: 'Enter an invite code' })
      return
    }

    setVerifying(true)
    setVerifiedMembers([])
    form.setValue('verifiedTeamName', undefined)

    try {
      const team = await verifyInviteCode({ inviteCode: code })
      form.setValue('verifiedTeamName', team.name)
      form.clearErrors('inviteCode')
      setVerifiedMembers(team.members)
      toast.success(`Found team: ${team.name}`)
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Could not verify invite code'
      form.setError('inviteCode', { message })
      if (error instanceof ApiClientError && error.code === 'TEAM_FULL') {
        toast.error(`Team is full (max ${event.teamMaxSize} members)`)
      }
    } finally {
      setVerifying(false)
    }
  }

  const copyCode = async () => {
    if (!previewCode) return
    await navigator.clipboard.writeText(previewCode)
    toast.success('Invite code copied')
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Team Setup</h2>
          <p className="text-sm text-muted-foreground">
            Create a new team or join an existing one. Teams must have{' '}
            {event.teamMinSize}–{event.teamMaxSize} members.
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
                  className="grid gap-3 sm:grid-cols-2"
                >
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

        {teamMode === 'create' ? (
          <>
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

            <FormField
              control={form.control}
              name="teamDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is your team building?"
                      className="resize-none"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-right">
                    {(field.value?.length ?? 0)}/200 characters
                  </FormDescription>
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
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Invite code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC123"
                        className="uppercase"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          form.setValue('verifiedTeamName', undefined)
                          setVerifiedMembers([])
                        }}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleVerifyCode()}
                  disabled={verifying}
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Code'}
                </Button>
              </div>
            </div>

            {form.watch('verifiedTeamName') && (
              <div className="rounded-lg border bg-green-500/5 p-4">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Team: {form.watch('verifiedTeamName')}
                </p>
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Current members ({verifiedMembers.length})
                  </p>
                  <ul className="space-y-2">
                    {verifiedMembers.map((m) => (
                      <li key={m.email} className="flex items-center gap-2 text-sm">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{m.name}</span>
                        <span className="text-muted-foreground">({m.role})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Form>
  )
}
