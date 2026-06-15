import { format } from 'date-fns'
import type { Score } from '@/types'
import { SCORE_CRITERIA } from './schemas'

interface ReadOnlyScoreViewProps {
  existingScore: Score
}

export function ReadOnlyScoreView({ existingScore }: ReadOnlyScoreViewProps) {
  return (
    <div className="space-y-5">
      {SCORE_CRITERIA.map(({ key, label, description }) => (
        <div key={key} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {existingScore[key]}
            </span>
          </div>
        </div>
      ))}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Judge comments</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {existingScore.comments}
        </p>
        {existingScore.submittedAt && (
          <p className="mt-3 text-xs text-muted-foreground">
            Scored {format(new Date(existingScore.submittedAt), 'PPpp')}
          </p>
        )}
      </div>
    </div>
  )
}
