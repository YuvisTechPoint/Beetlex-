import type { Registration } from '@/types'
import { mockTeams } from './teams'

export const mockRegistrations: Registration[] = mockTeams.flatMap((team) =>
  team.members.map((member, index) => ({
    id: `reg-${team.id}-${index + 1}`,
    userId: member.userId,
    eventId: team.eventId,
    teamId: team.id,
    registrationCode: `BX-${team.inviteCode}`,
    createdAt: member.joinedAt,
  })),
)
