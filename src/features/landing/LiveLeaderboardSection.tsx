import { PublicLiveLeaderboard } from '@/components/shared/PublicLiveLeaderboard'
import { LIVE_LEADERBOARD_EVENT_ID } from './constants'

export function LiveLeaderboardSection() {
  return (
    <section
      className="section-shell border-t bg-muted/15"
      aria-labelledby="live-leaderboard-heading"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <PublicLiveLeaderboard
          eventId={LIVE_LEADERBOARD_EVENT_ID}
          eventTitle="BeetleX AI Forge 2026"
          showDashboardLink
        />
      </div>
    </section>
  )
}
