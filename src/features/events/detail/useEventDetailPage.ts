import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useEvent, useMyRegistrations } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/uiStore'
import { resolveShowcaseSponsors } from '@/data/sponsors'
import { calculatePrizePool } from '@/utils'
import type { Event } from '@/types'
import { toast } from 'sonner'

export function useEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, isError } = useEvent(id, { refetchInterval: 30_000 })
  const { data: registrations } = useMyRegistrations()
  const { isAuthenticated } = useAuth()
  const openSignIn = useUiStore((s) => s.openSignIn)

  const isRegistered = useMemo(
    () => registrations?.some((r) => r.eventId === id) ?? false,
    [registrations, id],
  )

  const registrationOpen = useMemo(() => {
    if (!event) return false
    const now = Date.now()
    return (
      now >= new Date(event.registrationOpen).getTime() &&
      now <= new Date(event.registrationClose).getTime() &&
      event.status !== 'closed'
    )
  }, [event])

  const prizePool = event ? calculatePrizePool(event.prizes) : 0
  const teamCount = event
    ? Math.floor(event.participantCount / ((event.teamMinSize + event.teamMaxSize) / 2))
    : 0

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  const prizesByTrack = useMemo(() => {
    if (!event) return new Map<string, Event['prizes']>()
    const map = new Map<string, Event['prizes']>()
    for (const prize of event.prizes) {
      const existing = map.get(prize.trackId) ?? []
      map.set(prize.trackId, [...existing, prize])
    }
    return map
  }, [event])

  const showcaseSponsors = useMemo(
    () => resolveShowcaseSponsors(event?.sponsors),
    [event?.sponsors],
  )

  return {
    event,
    isLoading,
    isError,
    isRegistered,
    registrationOpen,
    prizePool,
    teamCount,
    shareUrl,
    copyLink,
    prizesByTrack,
    showcaseSponsors,
    isAuthenticated,
    openSignIn,
  }
}
