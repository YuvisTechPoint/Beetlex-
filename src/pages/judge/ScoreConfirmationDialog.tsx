import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SCORE_CRITERIA, computeTotalScore, type ScoringFormValues } from '@/pages/judge/schemas'
import { Loader2 } from 'lucide-react'

interface ScoreConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTitle: string
  teamName: string
  values: ScoringFormValues
  onConfirm: () => void
  isSubmitting?: boolean
  isOverwrite?: boolean
}

export function ScoreConfirmationDialog({
  open,
  onOpenChange,
  projectTitle,
  teamName,
  values,
  onConfirm,
  isSubmitting,
  isOverwrite,
}: ScoreConfirmationDialogProps) {
  const total = computeTotalScore(values)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isOverwrite ? 'Overwrite existing score?' : 'Confirm score submission'}</DialogTitle>
          <DialogDescription>
            {isOverwrite ? (
              <>
                You have already scored this project. Submitting again will{' '}
                <strong>permanently replace</strong> your previous score for{' '}
                <span className="font-medium text-foreground">{projectTitle}</span>.
              </>
            ) : (
              <>
                Review your scores for{' '}
                <span className="font-medium text-foreground">{projectTitle}</span> by {teamName}. This
                action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {SCORE_CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">{values[key]} / 10</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total score</span>
            <span className="text-lg font-semibold tabular-nums">{total} / 40</span>
          </div>
          {values.comments && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Comments</p>
              <p className="text-sm leading-relaxed">{values.comments}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Go back
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Submit score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
