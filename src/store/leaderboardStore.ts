import { create } from 'zustand'
import type { LeaderboardEntry } from '@/types'

export type LeaderboardConnectionMode = 'live' | 'degraded' | 'connecting' | 'disconnected'

export interface LeaderboardScoreEvent {
  sequenceNumber: number
  teamId: string
  teamName: string
  trackId: string
  score: number
  delta: number
  rank: number
  previousRank: number
}

interface LeaderboardState {
  entries: Map<string, LeaderboardEntry>
  lastSequence: number
  connectionMode: LeaderboardConnectionMode
  setConnectionMode: (mode: LeaderboardConnectionMode) => void
  setSnapshot: (entries: LeaderboardEntry[]) => void
  applyScoreEvents: (events: LeaderboardScoreEvent[]) => void
  getSortedEntries: () => LeaderboardEntry[]
  reset: () => void
}

function resortEntries(map: Map<string, LeaderboardEntry>): LeaderboardEntry[] {
  return [...map.values()].sort((a, b) => a.rank - b.rank)
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: new Map(),
  lastSequence: 0,
  connectionMode: 'connecting',

  setConnectionMode: (mode) => set({ connectionMode: mode }),

  setSnapshot: (entries) => {
    const map = new Map(entries.map((e) => [e.teamId, e]))
    set({ entries: map })
  },

  applyScoreEvents: (events) => {
    if (events.length === 0) return

    const state = get()
    const map = new Map(state.entries)
    let lastSequence = state.lastSequence

    const sorted = [...events].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    for (const event of sorted) {
      if (event.sequenceNumber <= lastSequence) continue
      map.set(event.teamId, {
        teamId: event.teamId,
        teamName: event.teamName,
        trackId: event.trackId,
        score: event.score,
        delta: event.delta,
        rank: event.rank,
        previousRank: event.previousRank,
      })
      lastSequence = event.sequenceNumber
    }

    set({ entries: map, lastSequence })
  },

  getSortedEntries: () => resortEntries(get().entries),

  reset: () => set({ entries: new Map(), lastSequence: 0, connectionMode: 'connecting' }),
}))
