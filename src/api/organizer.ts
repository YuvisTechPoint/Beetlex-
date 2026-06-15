import { apiClient } from './client'
import type { Announcement, LeaderboardEntry } from '@/types'

export interface OrganizerStats {
  totalParticipants: number
  totalTeams: number
  registrationsToday: number
  submissionsReceived: number
  submissionsPending: number
  draftSubmissions: number
  judgingProgress: number
  tracksBreakdown: { trackId: string; trackName: string; teamCount: number }[]
}

export interface OrganizerParticipant {
  userId: string
  name: string
  email: string
  college?: string
  teamId: string
  teamName: string
  trackId: string
  trackName: string
  registrationCode: string
  registeredAt: string
  status: 'registered' | 'submitted' | 'draft'
}

export interface OrganizerSubmissionSummary {
  id: string
  teamId: string
  teamName: string
  title: string
  description: string
  trackId: string
  trackName: string
  techStack: string[]
  demoUrl: string
  repoUrl: string
  pitchDeckUrl?: string
  videoUrl?: string
  isDraft: boolean
  submittedAt?: string
  scoreCount: number
  averageScore?: number
  assignedJudgeIds: string[]
  status: 'draft' | 'submitted' | 'scored'
  scoreBreakdown?: {
    innovation: number
    technicalExecution: number
    impact: number
    presentation: number
  }
}

export interface OrganizerActivityItem {
  id: string
  message: string
  createdAt: string
  type: 'registration' | 'submission' | 'score' | 'announcement'
}

export interface OrganizerJudge {
  id: string
  name: string
  email: string
  organization?: string
  assignedTrackId?: string
  assignedTrackName?: string
  assignedProjectCount: number
  reviewedCount: number
  pendingCount: number
}

export function getOrganizerStats() {
  return apiClient.get<OrganizerStats>('/organizer/stats')
}

export function getParticipants() {
  return apiClient.get<OrganizerParticipant[]>('/organizer/participants')
}

export function getOrganizerSubmissions() {
  return apiClient.get<OrganizerSubmissionSummary[]>('/organizer/submissions')
}

export function getOrganizerActivity() {
  return apiClient.get<OrganizerActivityItem[]>('/organizer/activity')
}

export function getOrganizerJudges() {
  return apiClient.get<OrganizerJudge[]>('/organizer/judges')
}

export interface AssignJudgePayload {
  judgeId: string
  trackId: string
}

export function assignJudge(payload: AssignJudgePayload) {
  return apiClient.post<OrganizerJudge[]>('/organizer/judges/assign', payload)
}

export interface AssignSubmissionJudgePayload {
  submissionId: string
  judgeId: string
}

export function assignSubmissionJudge({ submissionId, judgeId }: AssignSubmissionJudgePayload) {
  return apiClient.post<OrganizerSubmissionSummary>(
    `/organizer/submissions/${submissionId}/assign-judge`,
    { judgeId },
  )
}

export interface BroadcastAnnouncementPayload {
  eventId: string
  title: string
  message: string
  priority: Announcement['priority']
}

export function broadcastAnnouncement(payload: BroadcastAnnouncementPayload) {
  return apiClient.post<Announcement>('/organizer/announcements', payload)
}

export function getLeaderboard() {
  return apiClient.get<LeaderboardEntry[]>('/organizer/leaderboard')
}

export function getLeaderboardStatus() {
  return apiClient.get<{ published: boolean }>('/organizer/leaderboard/status')
}

export interface UpdateLeaderboardPayload {
  entries: LeaderboardEntry[]
}

export function updateLeaderboard(payload: UpdateLeaderboardPayload) {
  return apiClient.put<LeaderboardEntry[]>('/organizer/leaderboard', payload)
}

export function setLeaderboardPublished(published: boolean) {
  return apiClient.put<{ published: boolean }>('/organizer/leaderboard/publish', { published })
}
