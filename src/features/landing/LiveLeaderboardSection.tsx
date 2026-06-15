import { PublicLiveLeaderboard } from '@/components/shared/PublicLiveLeaderboard'
import { LIVE_LEADERBOARD_EVENT_ID } from './constants'

export function LiveLeaderboardSection() {
  return (
    <section
      className="border-t bg-muted/20 py-20"
      aria-labelledby="live-leaderboard-heading"
    >
      <div className="container mx-auto px-4">
        <h2 id="live-leaderboard-heading" className="sr-only">
          Live Leaderboard
        </h2>
        <PublicLiveLeaderboard
          eventId={LIVE_LEADERBOARD_EVENT_ID}
          eventTitle="BeetleX Global Hackathon"
          showDashboardLink
        />
      </div>
    </section>
  )
}
