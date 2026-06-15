import { mockTeams } from './teams'
import { mockSubmissions } from './submissions'
import { mockUsers, mockUserById } from './users'
import { countParticipantsForEvent } from './scaleTeams'

const ACTIVE_EVENT_ID = 'evt-active-1'
const activeEventTeams = mockTeams.filter((team) => team.eventId === ACTIVE_EVENT_ID)
const activeEventSubmissions = mockSubmissions.filter((sub) => sub.eventId === ACTIVE_EVENT_ID)

function trackBreakdown() {
  const trackIds = [
    'evt-active-1-track-devtools',
    'evt-active-1-track-ai',
    'evt-active-1-track-ml',
    'evt-active-1-track-web3',
  ] as const
  const names: Record<string, string> = {
    'evt-active-1-track-devtools': 'IDE & Editor Extensions',
    'evt-active-1-track-ai': 'AI Code Assistants',
    'evt-active-1-track-ml': 'Observability & Performance',
    'evt-active-1-track-web3': 'Web3 Dev Infrastructure',
  }
  return trackIds.map((trackId) => ({
    trackId,
    trackName: names[trackId],
    teamCount: activeEventTeams.filter((team) => team.trackId === trackId).length,
  }))
}

const scoredCount = activeEventSubmissions.filter(
  (sub) => !sub.isDraft && (sub.scores?.length ?? 0) > 0,
).length
const submittedCount = activeEventSubmissions.filter((sub) => !sub.isDraft).length

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

export const mockOrganizerStats: OrganizerStats = {
  totalParticipants: countParticipantsForEvent(mockTeams, ACTIVE_EVENT_ID),
  totalTeams: activeEventTeams.length,
  registrationsToday: Math.max(
    3,
    activeEventTeams
      .flatMap((team) => team.members)
      .filter((member) => {
        const joined = new Date(member.joinedAt).getTime()
        return joined >= Date.now() - 86_400_000
      }).length,
  ),
  submissionsReceived: submittedCount,
  submissionsPending: activeEventSubmissions.filter(
    (sub) => !sub.isDraft && (sub.scores?.length ?? 0) === 0,
  ).length,
  draftSubmissions: activeEventSubmissions.filter((sub) => sub.isDraft).length,
  judgingProgress: submittedCount > 0 ? Math.round((scoredCount / submittedCount) * 100) : 0,
  tracksBreakdown: trackBreakdown(),
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

const TRACK_NAMES: Record<string, string> = {
  'evt-active-1-track-devtools': 'IDE & Editor Extensions',
  'evt-active-1-track-ai': 'AI Code Assistants',
  'evt-active-1-track-ml': 'Observability & Performance',
  'evt-active-1-track-web3': 'Web3 Dev Infrastructure',
}

function participantStatus(team: (typeof mockTeams)[number]): OrganizerParticipant['status'] {
  if (team.submissionStatus === 'submitted') return 'submitted'
  if (team.submissionStatus === 'draft') return 'draft'
  return 'registered'
}

export const mockOrganizerParticipants: OrganizerParticipant[] = mockTeams.flatMap((team) =>
  team.members.map((member) => ({
    userId: member.userId,
    name: member.name,
    email: member.email,
    college: mockUserById[member.userId]?.college ?? mockUserById[member.userId]?.organization,
    teamId: team.id,
    teamName: team.name,
    trackId: team.trackId,
    trackName: TRACK_NAMES[team.trackId] ?? team.trackId,
    registrationCode: `BX-${team.inviteCode}`,
    registeredAt: member.joinedAt,
    status: participantStatus(team),
  })),
)

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

export interface OrganizerJudgeAssignment {
  judgeId: string
  trackId: string
}

export interface SubmissionJudgeAssignment {
  submissionId: string
  judgeId: string
}

export const mockOrganizerSubmissions: OrganizerSubmissionSummary[] = mockSubmissions.map((sub) => {
  const team = mockTeams.find((t) => t.id === sub.teamId)
  const scores = sub.scores ?? []
  const avg =
    scores.length > 0
      ? scores.reduce(
          (sum, s) => sum + s.innovation + s.technicalExecution + s.impact + s.presentation,
          0,
        ) /
        scores.length /
        4
      : undefined
  const trackId = team?.trackId ?? ''
  return {
    id: sub.id,
    teamId: sub.teamId,
    teamName: team?.name ?? 'Unknown',
    title: sub.title,
    description: sub.description,
    trackId,
    trackName: TRACK_NAMES[trackId] ?? trackId,
    techStack: sub.techStack,
    demoUrl: sub.demoUrl,
    repoUrl: sub.repoUrl,
    pitchDeckUrl: sub.pitchDeckUrl,
    videoUrl: sub.videoUrl,
    isDraft: sub.isDraft,
    submittedAt: sub.submittedAt,
    scoreCount: scores.length,
    averageScore: avg,
    assignedJudgeIds: [],
    status: sub.isDraft ? 'draft' : scores.length > 0 ? 'scored' : 'submitted',
    scoreBreakdown:
      scores.length > 0
        ? {
            innovation: scores.reduce((sum, s) => sum + s.innovation, 0) / scores.length,
            technicalExecution:
              scores.reduce((sum, s) => sum + s.technicalExecution, 0) / scores.length,
            impact: scores.reduce((sum, s) => sum + s.impact, 0) / scores.length,
            presentation: scores.reduce((sum, s) => sum + s.presentation, 0) / scores.length,
          }
        : undefined,
  }
})

function buildJudgeSummaries(): OrganizerJudge[] {
  return mockUsers
    .filter((user) => user.role === 'judge')
    .map((judge) => {
      const assignedSubs = mockSubmissions.filter(
        (sub) =>
          !sub.isDraft && (sub.scores ?? []).some((score) => score.judgeId === judge.id) === false,
      )
      const reviewed = mockSubmissions.filter(
        (sub) => !sub.isDraft && (sub.scores ?? []).some((score) => score.judgeId === judge.id),
      ).length
      const trackId =
        judge.id === 'user-judge-1'
          ? 'evt-active-1-track-devtools'
          : judge.id === 'user-judge-2'
            ? 'evt-active-1-track-ai'
            : 'evt-active-1-track-ml'

      return {
        id: judge.id,
        name: judge.name,
        email: judge.email,
        organization: judge.organization,
        assignedTrackId: trackId,
        assignedTrackName: TRACK_NAMES[trackId],
        assignedProjectCount: assignedSubs.length + reviewed,
        reviewedCount: reviewed,
        pendingCount: Math.max(0, assignedSubs.length - reviewed),
      }
    })
}

export const mockOrganizerJudges: OrganizerJudge[] = buildJudgeSummaries()

export const mockOrganizerActivity: OrganizerActivityItem[] = [
  {
    id: 'act-1',
    message: "Team 'Neural Navigators' just submitted their project",
    createdAt: '2026-06-12T21:45:00.000Z',
    type: 'submission',
  },
  {
    id: 'act-2',
    message: "Judge Dr. Ananya Rao scored project 'ContextHub — Inline Dev Context for IDEs'",
    createdAt: '2026-06-14T11:30:00.000Z',
    type: 'score',
  },
  {
    id: 'act-3',
    message: "Team 'CodeFlow Labs' just submitted their project",
    createdAt: '2026-06-12T22:30:00.000Z',
    type: 'submission',
  },
  {
    id: 'act-4',
    message: 'Alex Chen registered for DevTools Velocity Hack',
    createdAt: '2026-05-02T10:30:00.000Z',
    type: 'registration',
  },
  {
    id: 'act-5',
    message: "Judge James Okafor scored project 'SecureReview Bot — AI-Powered Code Security'",
    createdAt: '2026-06-14T12:00:00.000Z',
    type: 'score',
  },
  {
    id: 'act-6',
    message: 'Broadcast: Submission Deadline Extended by 2 Hours',
    createdAt: '2026-06-12T20:00:00.000Z',
    type: 'announcement',
  },
]

export const mockOrganizerJudgeAssignments: OrganizerJudgeAssignment[] = [
  { judgeId: 'user-judge-1', trackId: 'evt-active-1-track-devtools' },
  { judgeId: 'user-judge-2', trackId: 'evt-active-1-track-ai' },
  { judgeId: 'user-judge-3', trackId: 'evt-active-1-track-ml' },
]

export const mockSubmissionJudgeAssignments: SubmissionJudgeAssignment[] = []
