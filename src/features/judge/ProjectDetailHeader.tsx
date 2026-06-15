import { Badge } from '@/components/ui/badge'
import type { JudgeQueueItem } from '@/types'

interface ProjectDetailHeaderProps {
  title: string
  queueItem?: JudgeQueueItem
  readOnly: boolean
  isAlreadyScored: boolean
}

export function ProjectDetailHeader({
  title,
  queueItem,
  readOnly,
  isAlreadyScored,
}: ProjectDetailHeaderProps) {
  return (
    <div className="shrink-0 border-b p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {queueItem?.teamName ?? 'Team'} · {queueItem?.trackName ?? 'Track'}
          </p>
        </div>
        {readOnly ? (
          <Badge variant="outline">Read-only review</Badge>
        ) : isAlreadyScored ? (
          <Badge variant="secondary">Previously scored</Badge>
        ) : null}
      </div>
    </div>
  )
}
