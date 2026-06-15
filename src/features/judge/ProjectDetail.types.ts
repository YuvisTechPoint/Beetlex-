import type { JudgeQueueItem } from '@/api/judges'

export interface ProjectDetailProps {
  submissionId: string
  queueItem?: JudgeQueueItem
  onScored?: () => void
  readOnly?: boolean
}
