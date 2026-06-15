import { apiClient } from './client'
import type { JudgeQueueItem, Score, Submission, SubmitScorePayload } from '@/types'

export type { JudgeQueueItem, SubmitScorePayload }

export function getJudgeQueue() {
  return apiClient.get<JudgeQueueItem[]>('/judge/queue')
}

export function getJudgeSubmission(id: string) {
  return apiClient.get<Submission>(`/judge/submissions/${id}`)
}

export function submitScore(submissionId: string, payload: SubmitScorePayload) {
  return apiClient.post<Score>(`/judge/submissions/${submissionId}/score`, payload)
}
