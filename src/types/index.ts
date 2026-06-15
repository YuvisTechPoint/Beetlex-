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
