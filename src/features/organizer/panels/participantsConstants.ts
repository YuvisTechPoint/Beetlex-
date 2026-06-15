import type { OrganizerParticipant } from '@/api/organizer'

export const VIRTUAL_VIEWPORT_HEIGHT = 520
export const VIRTUAL_ROW_HEIGHT = 52

export type ParticipantSortKey = keyof OrganizerParticipant | 'index'
export type ParticipantSortDir = 'asc' | 'desc'

export const PARTICIPANT_STATUS_STYLES = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  submitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
} as const
