import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type LeaderboardPublishDialogProps = {
  open: boolean
  pendingPublish: boolean | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LeaderboardPublishDialog({
  open,
  pendingPublish,
  isPending,
  onOpenChange,
  onConfirm,
}: LeaderboardPublishDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pendingPublish ? 'Publish Results?' : 'Unpublish Results?'}</DialogTitle>
          <DialogDescription>
            {pendingPublish
              ? 'Participants will immediately see the leaderboard on their dashboards.'
              : 'The leaderboard will be hidden from all participant dashboards.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
