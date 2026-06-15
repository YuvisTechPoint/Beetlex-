import { Separator } from '@/components/ui/separator'
import { useJudgeSubmission } from '@/hooks/useJudgeSubmission'
import { ProjectDetailHeader } from './ProjectDetailHeader'
import { ProjectDetailSkeleton } from './ProjectDetailSkeleton'
import { ProjectMediaViewers } from './ProjectMediaViewers'
import { ScoringSection } from './ScoringSection'
import { ScoreConfirmationDialog } from './ScoreConfirmationDialog'
import { useProjectDetailScoring } from './useProjectDetailScoring'
import type { ProjectDetailProps } from '@/types'

export function ProjectDetail({
  submissionId,
  queueItem,
  onScored,
  readOnly = false,
}: ProjectDetailProps) {
  const { data: submission, isLoading, isError } = useJudgeSubmission(submissionId)
  const scoring = useProjectDetailScoring({ submission, submissionId, onScored })

  if (isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (isError || !submission) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">Unable to load submission details.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ProjectDetailHeader
        title={submission.title}
        queueItem={queueItem}
        readOnly={readOnly}
        isAlreadyScored={scoring.isAlreadyScored}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4">
          <ProjectMediaViewers submission={submission} />

          <Separator className="my-6" />

          <ScoringSection
            readOnly={readOnly}
            existingScore={scoring.existingScore}
            totalScore={scoring.totalScore}
            scoring={scoring}
          />
        </div>
      </div>

      {!readOnly && scoring.pendingValues && (
        <ScoreConfirmationDialog
          open={scoring.confirmOpen}
          onOpenChange={scoring.setConfirmOpen}
          projectTitle={submission.title}
          teamName={queueItem?.teamName ?? 'Team'}
          values={scoring.pendingValues}
          onConfirm={scoring.handleConfirmSubmit}
          isSubmitting={scoring.isSubmitting}
          isOverwrite={scoring.isAlreadyScored}
        />
      )}
    </div>
  )
}
