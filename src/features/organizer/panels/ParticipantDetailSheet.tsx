import type { OrganizerParticipant } from '@/api/organizer'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils'
import { PARTICIPANT_STATUS_STYLES } from './participantsConstants'

type ParticipantDetailSheetProps = {
  participant: OrganizerParticipant | null
  onClose: () => void
}

export function ParticipantDetailSheet({ participant, onClose }: ParticipantDetailSheetProps) {
  return (
    <Sheet open={Boolean(participant)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {participant && (
          <>
            <SheetHeader>
              <SheetTitle>{participant.name}</SheetTitle>
              <SheetDescription>{participant.email}</SheetDescription>
            </SheetHeader>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">College / Org</dt>
                <dd className="font-medium">{participant.college ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Team</dt>
                <dd className="font-medium">{participant.teamName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Track</dt>
                <dd className="font-medium">{participant.trackName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Registration Code</dt>
                <dd className="font-mono font-medium">{participant.registrationCode}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge
                    variant="outline"
                    className={cn(PARTICIPANT_STATUS_STYLES[participant.status])}
                  >
                    {participant.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Registered</dt>
                <dd className="font-medium">{formatDateTime(participant.registeredAt)}</dd>
              </div>
            </dl>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
