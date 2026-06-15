import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ApiClientError } from '@/api/client'
import { verifyInviteCode } from '@/api/registrations'
import { useRegister } from '@/hooks/useRegister'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const joinTeamSchema = z.object({
  inviteCode: z.string().trim().min(1, 'Enter an invite code'),
})

type JoinTeamFormValues = z.infer<typeof joinTeamSchema>

interface JoinTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinTeamDialog({ open, onOpenChange }: JoinTeamDialogProps) {
  const { joinTeamMutation } = useRegister()
  const [verifying, setVerifying] = useState(false)
  const [verifiedTeamName, setVerifiedTeamName] = useState<string | null>(null)
  const [verifiedMembers, setVerifiedMembers] = useState<
    { name: string; email: string; role: string }[]
  >([])

  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: { inviteCode: '' },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setVerifiedTeamName(null)
      setVerifiedMembers([])
      joinTeamMutation.reset()
    }
  }, [open, form, joinTeamMutation])

  const handleVerify = async () => {
    const code = form.getValues('inviteCode')?.trim()
    if (!code) {
      form.setError('inviteCode', { message: 'Enter an invite code' })
      return
    }

    setVerifying(true)
    setVerifiedTeamName(null)
    setVerifiedMembers([])

    try {
      const team = await verifyInviteCode({ inviteCode: code })
      setVerifiedTeamName(team.name)
      setVerifiedMembers(team.members)
      form.clearErrors('inviteCode')
      toast.success(`Found team: ${team.name}`)
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Could not verify invite code'
      form.setError('inviteCode', { message })
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  const onSubmit = (values: JoinTeamFormValues) => {
    joinTeamMutation.mutate(
      { inviteCode: values.inviteCode.trim() },
      {
        onSuccess: (team) => {
          toast.success(`Joined team "${team.name}"`)
          onOpenChange(false)
        },
        onError: (error) => {
          const message = error instanceof ApiClientError ? error.message : 'Failed to join team'
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
            <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            Join a team
          </DialogTitle>
          <DialogDescription>
            Enter the invite code from your team leader to join their workspace.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          setVerifiedTeamName(null)
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
                  onClick={() => void handleVerify()}
                  disabled={verifying}
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            {verifiedTeamName && (
              <div className="rounded-lg border bg-green-500/5 p-4">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Team: {verifiedTeamName}
                </p>
                <ul className="mt-3 space-y-2">
                  {verifiedMembers.map((member) => (
                    <li key={member.email} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      <span className="text-muted-foreground">({member.role})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={joinTeamMutation.isPending}>
                {joinTeamMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Join team
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
