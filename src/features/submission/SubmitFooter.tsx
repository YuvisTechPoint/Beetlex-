import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitFooterProps {
  lastSaved: Date | null
  disabled?: boolean
  isValid: boolean
  isSubmitting?: boolean
  isSaving?: boolean
  onSaveDraft: () => void
}

export function SubmitFooter({
  lastSaved,
  disabled,
  isValid,
  isSubmitting,
  isSaving,
  onSaveDraft,
}: SubmitFooterProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 p-4 backdrop-blur md:left-60"
      role="toolbar"
      aria-label="Submission actions"
    >
      <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {lastSaved
            ? `Draft saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
            : 'Auto-saves every 60 seconds'}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isSaving}
            onClick={onSaveDraft}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Save Draft
          </Button>
          <Button type="submit" disabled={disabled || !isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              'Submit Project'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
