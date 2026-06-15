import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SubmissionFormValues } from './schemas'

interface SubmitConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingValues: SubmissionFormValues | null
  onConfirm: () => void
  isConfirming: boolean
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  pendingValues,
  onConfirm,
  isConfirming,
}: SubmitConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit your project?</DialogTitle>
          <DialogDescription>
            You cannot edit after final submission. Please review your details carefully.
          </DialogDescription>
        </DialogHeader>
        {pendingValues && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
            <p>
              <span className="font-medium">Title:</span> {pendingValues.title}
            </p>
            <p>
              <span className="font-medium">Tech:</span> {pendingValues.techStack.join(', ')}
            </p>
            <p>
              <span className="font-medium">Demo:</span> {pendingValues.demoUrl}
            </p>
            <p>
              <span className="font-medium">Repo:</span> {pendingValues.repoUrl}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isConfirming}>
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
