import { apiClient } from './client'
import type { Score, Submission } from '@/types'

export interface JudgeQueueItem {
  submissionId: string
  teamId: string
  teamName: string
  title: string
  trackId: string
  trackName: string
  submittedAt: string
  scored: boolean
}

export interface SubmitScorePayload {
  innovation: number
  technicalExecution: number
  impact: number
  presentation: number
  comments: string
}

export function getJudgeQueue() {
  return apiClient.get<JudgeQueueItem[]>('/judge/queue')
}

export function getJudgeSubmission(id: string) {
  return apiClient.get<Submission>(`/judge/submissions/${id}`)
}

export function submitScore(submissionId: string, payload: SubmitScorePayload) {
  return apiClient.post<Score>(`/judge/submissions/${submissionId}/score`, payload)
}
