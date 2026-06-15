import { apiClient } from './client'
import type { Submission } from '@/types'

export interface SaveSubmissionPayload {
  id?: string
  title: string
  description: string
  techStack: string[]
  demoUrl: string
  repoUrl: string
  pitchDeckUrl?: string
  videoUrl?: string
}

export function getMySubmission() {
  return apiClient.get<Submission | null>('/submissions/my')
}

export function saveSubmission(payload: SaveSubmissionPayload) {
  return apiClient.post<Submission>('/submissions', payload)
}

export function finalSubmit(submissionId: string) {
  return apiClient.put<Submission>(`/submissions/${submissionId}/submit`)
}

export interface UploadResponse {
  url: string
  field: string
}

export function uploadSubmissionFile(file: File, field: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('field', field)
  return apiClient.post<UploadResponse>('/submissions/upload', formData)
}
