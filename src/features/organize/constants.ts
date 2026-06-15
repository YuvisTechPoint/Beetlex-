import type { WizardStep } from '@/types'

export const CREATE_HACKATHON_STEPS: WizardStep[] = [
  { id: 'basics', label: 'Basics', description: 'Name and describe your hackathon' },
  { id: 'schedule', label: 'Schedule', description: 'Dates and team sizes' },
  { id: 'tracks', label: 'Tracks', description: 'Competition categories' },
]

export const ORGANIZER_FEATURES = [
  {
    title: 'Participant management',
    description: 'Track registrations, teams, and submission status in one place.',
  },
  {
    title: 'Judge assignments',
    description: 'Assign judges to tracks and balance review workloads automatically.',
  },
  {
    title: 'Live leaderboard',
    description: 'Publish standings during finals with real-time rank updates.',
  },
  {
    title: 'Announcements',
    description: 'Broadcast deadline reminders and updates to all participants.',
  },
] as const
