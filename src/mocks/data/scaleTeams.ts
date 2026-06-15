import type { Submission, Team } from '@/types'

const EVENT_ID = 'evt-active-1'
const TRACK_IDS = [
  'evt-active-1-track-devtools',
  'evt-active-1-track-ai',
  'evt-active-1-track-ml',
  'evt-active-1-track-web3',
] as const

const TEAM_PREFIXES = [
  'Code',
  'Neural',
  'Trace',
  'Chain',
  'Debug',
  'Prompt',
  'Stack',
  'Lint',
  'Byte',
  'Pixel',
  'Quantum',
  'Cloud',
  'Data',
  'Logic',
  'Syntax',
  'Kernel',
  'Binary',
  'Vector',
  'Cipher',
  'Flux',
]

const TEAM_SUFFIXES = [
  'Labs',
  'Forge',
  'Sync',
  'Squad',
  'Dynasty',
  'Pirates',
  'Navigators',
  'Crafters',
  'Architects',
  'Collective',
  'Systems',
  'Works',
  'Studio',
  'Guild',
  'Node',
]

const FIRST_NAMES = [
  'Aarav',
  'Maya',
  'Noah',
  'Priya',
  'Liam',
  'Sofia',
  'Kenji',
  'Amara',
  'Omar',
  'Elena',
  'Raj',
  'Chloe',
  'Diego',
  'Yuki',
  'Fatima',
  'Lucas',
  'Ananya',
  'Ethan',
  'Zara',
  'Tomás',
]

const LAST_NAMES = [
  'Chen',
  'Patel',
  'Kim',
  'Singh',
  'Garcia',
  'Müller',
  'Nair',
  'Brooks',
  'Tanaka',
  'Ahmed',
  'Rossi',
  'Okafor',
  'Laurent',
  'Hassan',
  'Park',
  'Volkov',
  'Khan',
  'Mendez',
  'Lee',
  'Ali',
]

const TECH_STACKS = [
  ['TypeScript', 'React', 'Node.js'],
  ['Python', 'FastAPI', 'PostgreSQL'],
  ['Rust', 'WebAssembly', 'Tokio'],
  ['Go', 'gRPC', 'Kubernetes'],
  ['Solidity', 'Hardhat', 'Ethers.js'],
  ['Swift', 'SwiftUI', 'Core ML'],
]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}

function inviteCode(rng: () => number, index: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const base = index * 7919
  for (let i = 0; i < 4; i++) {
    code += chars[(base + Math.floor(rng() * chars.length)) % chars.length]
  }
  return `SCL-${code}`
}

export function generateScaleTeams(count: number, startIndex = 21): Team[] {
  const rng = mulberry32(0xbeef1e)
  const teams: Team[] = []
  const baseDate = new Date('2026-04-01T08:00:00.000Z').getTime()

  for (let i = 0; i < count; i++) {
    const teamIndex = startIndex + i
    const trackId = pick(rng, TRACK_IDS)
    const memberCount = 2 + Math.floor(rng() * 3)
    const submissionRoll = rng()
    const submissionStatus: Team['submissionStatus'] =
      submissionRoll < 0.55
        ? 'submitted'
        : submissionRoll < 0.72
          ? 'draft'
          : 'not_started'

    const members = Array.from({ length: memberCount }, (_, memberIdx) => {
      const first = pick(rng, FIRST_NAMES)
      const last = pick(rng, LAST_NAMES)
      const userNum = teamIndex * 10 + memberIdx
      const joinedAt = new Date(
        baseDate + teamIndex * 86_400_000 + memberIdx * 3_600_000,
      ).toISOString()
      return {
        userId: `user-scale-${userNum}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${userNum}@scale.edu`,
        role: memberIdx === 0 ? ('leader' as const) : ('member' as const),
        joinedAt,
      }
    })

    const hasScore = submissionStatus === 'submitted' && rng() > 0.35
    const score = hasScore ? Math.round((65 + rng() * 30) * 10) / 10 : undefined
    const leaderboardPosition =
      hasScore && score !== undefined && score > 88 ? Math.floor(rng() * 50) + 11 : undefined

    teams.push({
      id: `team-scale-${teamIndex}`,
      name: `${pick(rng, TEAM_PREFIXES)} ${pick(rng, TEAM_SUFFIXES)} ${teamIndex}`,
      inviteCode: inviteCode(rng, teamIndex),
      eventId: EVENT_ID,
      trackId,
      submissionStatus,
      leaderboardPosition,
      score,
      members,
    })
  }

  return teams
}

export function generateScaleSubmissions(teams: Team[]): Submission[] {
  const rng = mulberry32(0x5ca1e)
  const submissions: Submission[] = []

  for (const team of teams) {
    if (team.submissionStatus !== 'submitted' && team.submissionStatus !== 'draft') continue

    const stack = pick(rng, TECH_STACKS)
    const isDraft = team.submissionStatus === 'draft'
    const hasScores = !isDraft && rng() > 0.4

    submissions.push({
      id: `sub-scale-${team.id}`,
      teamId: team.id,
      eventId: EVENT_ID,
      title: `${team.name} — ${stack[0]} Platform`,
      description: `A ${stack.join(', ')} solution built for the ${team.trackId} track. Scales to enterprise workloads with observable pipelines and resilient deployment workflows.`,
      techStack: [...stack],
      demoUrl: `https://demo.beetlex.io/${team.id}`,
      repoUrl: `https://github.com/beetlex-scale/${team.id}`,
      pitchDeckUrl: `https://demo.beetlex.io/${team.id}/deck.pdf`,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      submittedAt: isDraft
        ? undefined
        : new Date(
            new Date('2026-06-01T00:00:00.000Z').getTime() +
              parseInt(team.id.replace(/\D/g, ''), 10) * 3_600_000,
          ).toISOString(),
      isDraft,
      scores: hasScores
        ? [
            {
              judgeId: 'user-judge-1',
              innovation: 18 + Math.floor(rng() * 8),
              technicalExecution: 20 + Math.floor(rng() * 8),
              impact: 17 + Math.floor(rng() * 9),
              presentation: 16 + Math.floor(rng() * 8),
              comments: 'Solid execution at scale.',
              submittedAt: '2026-06-14T10:00:00.000Z',
            },
          ]
        : undefined,
    })
  }

  return submissions
}

export function countParticipantsForEvent(teams: Team[], eventId: string): number {
  return teams.filter((t) => t.eventId === eventId).reduce((sum, t) => sum + t.members.length, 0)
}

export function countTeamsForEvent(teams: Team[], eventId: string): number {
  return teams.filter((t) => t.eventId === eventId).length
}
