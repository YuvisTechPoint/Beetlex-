import type {
  Announcement,
  Event,
  LeaderboardEntry,
  Notification,
  Registration,
  Submission,
  Team,
  User,
} from '@/types'
import {
  mockAnnouncements,
  mockEvents,
  mockLeaderboard,
  mockNotifications,
  mockOrganizerActivity,
  mockOrganizerJudgeAssignments,
  mockOrganizerStats,
  mockRegistrations,
  mockSubmissionJudgeAssignments,
  mockSubmissions,
  mockTeams,
  mockUsers,
} from '@/mocks/data'
import type {
  OrganizerActivityItem,
  OrganizerJudgeAssignment,
  SubmissionJudgeAssignment,
} from '@/mocks/data/organizer'
import type { OrganizerStats } from '@/mocks/data/organizer'

export interface AuthSessionRecord {
  token: string
  userId: string
  createdAt: string
  lastSeenAt: string
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export const db = {
  users: clone(mockUsers) as User[],
  authSessions: {} as Record<string, AuthSessionRecord>,
  revokedTokens: new Set<string>(),
  events: clone(mockEvents) as Event[],
  teams: clone(mockTeams) as Team[],
  registrations: clone(mockRegistrations) as Registration[],
  submissions: clone(mockSubmissions) as Submission[],
  leaderboard: clone(mockLeaderboard) as LeaderboardEntry[],
  notifications: clone(mockNotifications) as Notification[],
  announcements: clone(mockAnnouncements) as Announcement[],
  organizerStats: clone(mockOrganizerStats) as OrganizerStats,
  organizerActivity: clone(mockOrganizerActivity) as OrganizerActivityItem[],
  judgeAssignments: clone(mockOrganizerJudgeAssignments) as OrganizerJudgeAssignment[],
  submissionJudgeAssignments: clone(
    mockSubmissionJudgeAssignments,
  ) as SubmissionJudgeAssignment[],
  leaderboardPublished: true,
  lastRandomNotificationAt: Date.now(),
  leaderboardSequence: 0,
  simulateRegistrationOverload: false,
  registerAttemptCounts: {} as Record<string, number>,
  registrationIdempotency: {} as Record<
    string,
    {
      registrationId: string
      registrationCode: string
      teamId: string
      inviteCode: string
      team: unknown
    }
  >,
}
