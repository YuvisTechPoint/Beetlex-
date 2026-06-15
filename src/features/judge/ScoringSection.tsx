import type { Score } from '@/types'
import { computeTotalScore } from './schemas'
import { ReadOnlyScoreView } from './ReadOnlyScoreView'
import { ScoringForm } from './ScoringForm'
import type { useProjectDetailScoring } from './useProjectDetailScoring'

interface ScoringSectionProps {
  readOnly: boolean
  existingScore: Score | null
  totalScore: number
  scoring: ReturnType<typeof useProjectDetailScoring>
}

export function ScoringSection({
  readOnly,
  existingScore,
  totalScore,
  scoring,
}: ScoringSectionProps) {
  const displayedTotal =
    readOnly && existingScore
      ? computeTotalScore({
          innovation: existingScore.innovation,
          technicalExecution: existingScore.technicalExecution,
          impact: existingScore.impact,
          presentation: existingScore.presentation,
        })
      : totalScore

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scoring rubric</h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total score</p>
          <p className="text-2xl font-bold tabular-nums">
            {displayedTotal}
            <span className="text-base font-normal text-muted-foreground">/40</span>
          </p>
        </div>
      </div>

      <p className="mb-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        Score guide: 1–3 weak · 4–6 average · 7–8 good · 9–10 exceptional
      </p>

      {readOnly ? (
        existingScore ? (
          <ReadOnlyScoreView existingScore={existingScore} />
        ) : (
          <p className="text-sm text-muted-foreground">No score recorded for this submission.</p>
        )
      ) : (
        <ScoringForm
          form={scoring.form}
          onSubmit={scoring.handleValidateAndConfirm}
          isSubmitting={scoring.isSubmitting}
          isAlreadyScored={scoring.isAlreadyScored}
        />
      )}
    </div>
  )
}
