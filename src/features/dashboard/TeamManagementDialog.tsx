import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leaveTeam, removeTeamMember } from '@/api/registrations'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TeamManagementDialogProps {
  leaveOpen: boolean
  removeTarget: string | null
  onLeaveOpenChange: (open: boolean) => void
  onRemoveTargetChange: (userId: string | null) => void
}

export function TeamManagementDialog({
  leaveOpen,
  removeTarget,
  onLeaveOpenChange,
  onRemoveTargetChange,
}: TeamManagementDialogProps) {
  const queryClient = useQueryClient()

  const leaveMutation = useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      toast.success('You have left the team')
    },
    onError: () => toast.error('Failed to leave team'),
  })

  const removeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
      toast.success('Member removed')
    },
    onError: () => toast.error('Failed to remove member'),
  })

  return (
    <>
      <Dialog open={leaveOpen} onOpenChange={onLeaveOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave team?</DialogTitle>
            <DialogDescription>
              You will lose access to this team&apos;s submission. This action cannot be undone in
              the demo environment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onLeaveOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={leaveMutation.isPending}
              onClick={() => {
                leaveMutation.mutate(undefined, {
                  onSuccess: () => onLeaveOpenChange(false),
                })
              }}
            >
              Leave team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removeTarget)} onOpenChange={() => onRemoveTargetChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              They will no longer have access to this team&apos;s workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onRemoveTargetChange(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => {
                if (!removeTarget) return
                removeMutation.mutate(removeTarget, {
                  onSuccess: () => onRemoveTargetChange(null),
                })
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
