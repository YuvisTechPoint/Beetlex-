import type { ComponentType } from 'react'
import type { RegistrationFormValues } from '@/features/registration/schemas'

// ─── Domain ────────────────────────────────────────────────────────────────

export interface Event {
  id: string
  title: string
  tagline: string
  description: string
  rules: string
  eligibility: string
  status: 'upcoming' | 'active' | 'closed'
  tracks: Track[]
  prizes: Prize[]
  sponsors: Sponsor[]
  timeline: TimelineItem[]
  registrationOpen: string
  registrationClose: string
  submissionDeadline: string
  judgingDate: string
  resultsDate: string
  participantCount: number
  teamMinSize: number
  teamMaxSize: number
  faqs: FAQ[]
  createdAt: string
}

export interface Track {
  id: string
  name: string
  description: string
  problemStatement: string
  techStack: string[]
}

export interface Prize {
  trackId: string
  rank: number
  amount: number
  currency: string
  perks: string[]
}

export interface Sponsor {
  id: string
  name: string
  logoUrl: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  website: string
  category?: SponsorCategory
  logoSlug?: string
}

export type SponsorCategory =
  | 'AI'
  | 'Web3'
  | 'Developer Tooling'
  | 'Cloud Infrastructure'
  | 'Machine Learning'

export interface TimelineItem {
  date: string
  label: string
  description: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface EventResource {
  id: string
  title: string
  description: string
  href: string
  icon: 'book' | 'file' | 'calendar' | 'message'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'participant' | 'judge' | 'organizer'
  college?: string
  organization?: string
  avatarUrl?: string
}

export interface Team {
  id: string
  name: string
  inviteCode: string
  eventId: string
  members: TeamMember[]
  trackId: string
  submissionStatus: 'not_started' | 'draft' | 'submitted'
  leaderboardPosition?: number
  score?: number
}

export interface TeamMember {
  userId: string
  name: string
  email: string
  role: 'leader' | 'member'
  joinedAt: string
}

export interface Registration {
  id: string
  userId: string
  eventId: string
  teamId: string
  registrationCode: string
  createdAt: string
}

export interface Submission {
  id: string
  teamId: string
  eventId: string
  title: string
  description: string
  techStack: string[]
  demoUrl: string
  repoUrl: string
  pitchDeckUrl?: string
  videoUrl?: string
  submittedAt?: string
  isDraft: boolean
  scores?: Score[]
}

export interface Score {
  judgeId: string
  innovation: number
  technicalExecution: number
  impact: number
  presentation: number
  comments: string
  submittedAt: string
}

export interface Announcement {
  id: string
  eventId: string
  title: string
  message: string
  priority: 'info' | 'warning' | 'urgent'
  createdAt: string
  readBy: string[]
}

export interface LeaderboardEntry {
  rank: number
  previousRank: number
  teamId: string
  teamName: string
  trackId: string
  score: number
  delta: number
}

export type NotificationType = 'announcement' | 'score_update' | 'deadline_alert' | 'system'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: 'info' | 'warning' | 'urgent'
  createdAt: string
  read: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UserRole = User['role']

// ─── Events listing ────────────────────────────────────────────────────────

export interface EventFilterState {
  search: string
  status: Event['status'] | 'all'
  track: string
  dateFrom: string
  dateTo: string
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export type DashboardTab = 'overview' | 'team' | 'leaderboard' | 'resources' | 'announcements'

export interface NavItem {
  id: DashboardTab | 'submit'
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
}

// ─── Organizer ─────────────────────────────────────────────────────────────

export type OrganizerTab =
  | 'overview'
  | 'participants'
  | 'submissions'
  | 'judges'
  | 'announcements'
  | 'leaderboard'

export interface CreateEventTrackInput {
  name: string
  description: string
}

export interface CreateEventPayload {
  title: string
  tagline: string
  description: string
  rules: string
  eligibility: string
  registrationOpen: string
  registrationClose: string
  submissionDeadline: string
  judgingDate: string
  resultsDate: string
  teamMinSize: number
  teamMaxSize: number
  tracks: CreateEventTrackInput[]
}

export interface CreateEventResponse {
  event: Event
  user: User
}

// ─── Registration ──────────────────────────────────────────────────────────

export interface WizardStep {
  id: string
  label: string
  description?: string
}

export interface RegistrationResult {
  registrationId?: string
  registrationCode?: string
  inviteCode?: string
  teamName?: string
  trackName?: string
  mode: 'create' | 'join' | 'solo'
}

export interface RegistrationDraft {
  values: RegistrationFormValues
  currentStep: number
}

// ─── Judge ─────────────────────────────────────────────────────────────────

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

export interface ProjectDetailProps {
  submissionId: string
  queueItem?: JudgeQueueItem
  onScored?: () => void
  readOnly?: boolean
}

// ─── Vite env ──────────────────────────────────────────────────────────────

declare global {
  interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY?: string
    readonly VITE_FIREBASE_AUTH_DOMAIN?: string
    readonly VITE_FIREBASE_PROJECT_ID?: string
    readonly VITE_FIREBASE_STORAGE_BUCKET?: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
    readonly VITE_FIREBASE_APP_ID?: string
    readonly VITE_GOOGLE_CLIENT_ID?: string
    readonly VITE_DISABLE_MSW?: string
    readonly VITE_STATIC_API?: string
    readonly VITE_ENABLE_MSW?: string
    readonly VITE_QA_FAST_MS?: string
  }
}

export {}
