import type { UseFormReturn } from 'react-hook-form'
import { Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ApiClientError } from '@/api/client'
import { verifyInviteCode } from '@/api/registrations'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Event } from '@/types'
import type { RegistrationFormValues } from './schemas'

export interface JoinTeamFieldsProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
  verifying: boolean
  setVerifying: (value: boolean) => void
  verifiedMembers: { name: string; email: string; role: string }[]
  setVerifiedMembers: (members: { name: string; email: string; role: string }[]) => void
}

export function JoinTeamFields({
  form,
  event,
  verifying,
  setVerifying,
  verifiedMembers,
  setVerifiedMembers,
}: JoinTeamFieldsProps) {
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
        error instanceof ApiClientError ? error.message : 'Could not verify invite code'
      form.setError('inviteCode', { message })
      if (error instanceof ApiClientError && error.code === 'TEAM_FULL') {
        toast.error(`Team is full (max ${event.teamMaxSize} members)`)
      }
    } finally {
      setVerifying(false)
    }
  }

  return (
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
  )
}
