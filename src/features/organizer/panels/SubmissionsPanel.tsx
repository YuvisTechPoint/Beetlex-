import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { OrganizerSubmissionSummary } from '@/api/organizer'
import { Skeleton } from '@/components/ui/skeleton'
import { useAssignSubmissionJudge } from '@/hooks/useAssignJudge'
import { useEvent } from '@/hooks/useEvent'
import { useOrganizerJudges } from '@/hooks/useOrganizerJudges'
import { useOrganizerSubmissions } from '@/hooks/useOrganizerSubmissions'
import { DEFAULT_EVENT_ID } from '../types'
import { SubmissionDetailSheet } from './SubmissionDetailSheet'
import { SubmissionsFilters } from './SubmissionsFilters'
import { SubmissionsTable } from './SubmissionsTable'

export default function SubmissionsPanel() {
  const { data: submissions, isLoading } = useOrganizerSubmissions()
  const { data: judges } = useOrganizerJudges()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const assignMutation = useAssignSubmissionJudge()
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detail, setDetail] = useState<OrganizerSubmissionSummary | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let rows = submissions ?? []
    if (trackFilter !== 'all') {
      rows = rows.filter((s) => s.trackId === trackFilter)
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((s) => s.status === statusFilter)
    }
    return rows
  }, [submissions, trackFilter, statusFilter])

  const handleAssign = async (submissionId: string, judgeId: string) => {
    try {
      await assignMutation.mutateAsync({ submissionId, judgeId })
      toast.success('Judge assigned successfully')
      setAssigningId(null)
    } catch {
      toast.error('Failed to assign judge')
    }
  }

  const toggleAssign = (submissionId: string) => {
    setAssigningId((current) => (current === submissionId ? null : submissionId))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Submissions</h2>
        <p className="text-muted-foreground">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <SubmissionsFilters
        trackFilter={trackFilter}
        onTrackFilterChange={setTrackFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        event={event}
      />

      <SubmissionsTable
        submissions={filtered}
        judges={judges}
        assigningId={assigningId}
        onView={setDetail}
        onToggleAssign={toggleAssign}
        onAssign={handleAssign}
      />

      <SubmissionDetailSheet submission={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
