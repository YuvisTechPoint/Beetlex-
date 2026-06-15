import type { Event } from '@/types'
import { pickShowcaseSponsors } from '@/mocks/data/sponsors'

const BASE_TRACK = {
  name: 'AI Builders',
  description: 'Ship production-ready AI features with measurable user impact.',
  problemStatement: 'Design an AI copilot that reduces developer onboarding time by 40%.',
  techStack: ['TypeScript', 'React', 'OpenAI', 'Vercel'],
}

function makeTimeline(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${year}-${pad(month)}`
  return [
    {
      date: `${base}-01T00:00:00.000Z`,
      label: 'Registration Opens',
      description: 'Teams can register and select tracks.',
    },
    {
      date: `${base}-15T23:59:59.000Z`,
      label: 'Registration Closes',
      description: 'Final roster lock.',
    },
    {
      date: `${base}-20T09:00:00.000Z`,
      label: 'Kickoff',
      description: 'Opening keynote and team sync.',
    },
    {
      date: `${base}-22T09:00:00.000Z`,
      label: 'Submission Deadline',
      description: 'Repos and demo videos due.',
    },
    {
      date: `${base}-23T10:00:00.000Z`,
      label: 'Judging',
      description: 'Live demos with judges.',
    },
    {
      date: `${base}-24T18:00:00.000Z`,
      label: 'Awards',
      description: 'Winners announced.',
    },
  ]
}

function makeEvent(
  id: string,
  title: string,
  tagline: string,
  status: Event['status'],
  month: number,
  year: number,
  participantCount: number,
  sponsorPrefix: string,
): Event {
  const trackId = `${id}-track-main`
  return {
    id,
    title,
    tagline,
    description: `${title} challenges teams to build ambitious projects across AI, Web3, and developer tooling with mentorship from ecosystem partners.`,
    rules: 'Teams of 2–4. All submissions must include a public repo and demo video.',
    eligibility: 'Open to students and professionals worldwide. Must be 16+.',
    status,
    tracks: [
      {
        id: trackId,
        ...BASE_TRACK,
        name: `${title.split(' ')[0]} Track`,
      },
    ],
    prizes: [
      {
        trackId,
        rank: 1,
        amount: 5000,
        currency: 'USD',
        perks: ['Cloud credits', 'Mentorship'],
      },
      {
        trackId,
        rank: 2,
        amount: 2500,
        currency: 'USD',
        perks: ['Swag kit'],
      },
    ],
    sponsors: pickShowcaseSponsors(
      [
        { name: 'Vercel', tier: 'gold' },
        { name: 'GitHub', tier: 'silver' },
        { name: 'Supabase', tier: 'bronze' },
      ],
      sponsorPrefix,
    ),
    timeline: makeTimeline(year, month),
    registrationOpen: `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`,
    registrationClose: `${year}-${String(month).padStart(2, '0')}-15T23:59:59.000Z`,
    submissionDeadline: `${year}-${String(month).padStart(2, '0')}-22T09:00:00.000Z`,
    judgingDate: `${year}-${String(month).padStart(2, '0')}-23T10:00:00.000Z`,
    resultsDate: `${year}-${String(month).padStart(2, '0')}-24T18:00:00.000Z`,
    participantCount,
    teamMinSize: 2,
    teamMaxSize: 4,
    faqs: [
      {
        question: 'Can I join solo?',
        answer: 'Teams require 2–4 members. Use Discord matching after registration opens.',
      },
      {
        question: 'What should we submit?',
        answer: 'GitHub repo, demo video, and live deploy URL.',
      },
    ],
    createdAt: `${year}-${String(month).padStart(2, '0')}-01T10:00:00.000Z`,
  }
}

/** Additional catalog events so pagination, filters, and responsive demos are meaningful. */
export const extraMockEvents: Event[] = [
  makeEvent(
    'evt-extra-1',
    'AgentForge Summit',
    'Build autonomous AI agents that ship',
    'upcoming',
    9,
    2026,
    128,
    'sp-ex1',
  ),
  makeEvent(
    'evt-extra-2',
    'EdgeML Challenge',
    'Optimize models for edge deployment',
    'upcoming',
    10,
    2026,
    96,
    'sp-ex2',
  ),
  makeEvent(
    'evt-extra-3',
    'DevTools Velocity',
    'Accelerate the developer inner loop',
    'active',
    6,
    2026,
    340,
    'sp-ex3',
  ),
  makeEvent(
    'evt-extra-4',
    'Cloud Native Builders',
    'Kubernetes, serverless, and platform engineering',
    'active',
    6,
    2026,
    275,
    'sp-ex4',
  ),
  makeEvent(
    'evt-extra-5',
    'Inference Sprint',
    'Low-latency LLM serving at scale',
    'active',
    5,
    2026,
    410,
    'sp-ex5',
  ),
  makeEvent(
    'evt-extra-6',
    'Open Source Odyssey',
    'Sustain and scale OSS communities',
    'closed',
    4,
    2025,
    180,
    'sp-ex6',
  ),
  makeEvent(
    'evt-extra-7',
    'RAG Masters',
    'Retrieval systems for production AI',
    'upcoming',
    11,
    2026,
    64,
    'sp-ex7',
  ),
  makeEvent(
    'evt-extra-8',
    'SecureCode Hack',
    'Security-first developer workflows',
    'active',
    6,
    2026,
    198,
    'sp-ex8',
  ),
]
