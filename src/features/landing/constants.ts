import type { Event } from '@/types'



export const FEATURED_EVENT_ID = 'evt-upcoming-1'

export const LIVE_LEADERBOARD_EVENT_ID = 'evt-active-1'



/** Minimal placeholder until React Query resolves the featured event (avoids bundling mock DB). */

export const FEATURED_EVENT_FALLBACK: Event = {

  id: FEATURED_EVENT_ID,

  title: 'BeetleX AI Forge 2026',

  tagline: 'Build the next generation of intelligent applications',

  description: '',

  rules: '',

  eligibility: '',

  status: 'upcoming',

  tracks: [],

  prizes: [],

  sponsors: [],

  timeline: [],

  registrationOpen: '2026-07-01T00:00:00.000Z',

  registrationClose: '2026-08-15T23:59:59.000Z',

  submissionDeadline: '2026-08-24T09:00:00.000Z',

  judgingDate: '2026-08-25T10:00:00.000Z',

  resultsDate: '2026-08-26T18:00:00.000Z',

  participantCount: 0,

  teamMinSize: 1,

  teamMaxSize: 4,

  faqs: [],

  createdAt: '2026-06-01T00:00:00.000Z',

}



export const EXTRA_FAQS = [

  {

    question: 'How do I form a team?',

    answer:

      'You can create a new team during registration and share your invite code, or join an existing team with a code from your team leader.',

  },

  {

    question: 'What happens after I register?',

    answer:

      'After registration you get access to the team dashboard where you can manage your team, submit your project, and track announcements.',

  },

] as const

