import type { LeaderboardEntry } from '@/types'

const TRACK_LABELS: Record<string, string> = {
  ai: 'Generative AI',
  ml: 'Machine Learning',
  devtools: 'DevTools',
  web3: 'Web3',
}

export function formatTrackLabel(trackId: string): string {
  const slug = trackId.split('-').pop() ?? trackId
  return TRACK_LABELS[slug] ?? slug.replace(/^\w/, (c) => c.toUpperCase())
}

export function teamInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function maxScore(entries: LeaderboardEntry[]): number {
  return Math.max(...entries.map((e) => e.score), 100)
}

export const PODIUM_STYLES = {
  1: {
    ring: 'ring-amber-400/50',
    bg: 'bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent',
    badge: 'bg-amber-500 text-amber-950',
    label: '1st',
  },
  2: {
    ring: 'ring-slate-300/50 dark:ring-slate-400/40',
    bg: 'bg-gradient-to-b from-slate-400/15 via-slate-400/5 to-transparent',
    badge: 'bg-slate-300 text-slate-900 dark:bg-slate-400 dark:text-slate-950',
    label: '2nd',
  },
  3: {
    ring: 'ring-orange-600/40',
    bg: 'bg-gradient-to-b from-orange-700/20 via-orange-600/5 to-transparent',
    badge: 'bg-orange-700 text-orange-50 dark:bg-orange-600',
    label: '3rd',
  },
} as const
