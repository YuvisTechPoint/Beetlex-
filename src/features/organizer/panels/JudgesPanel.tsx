import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAssignJudge } from '@/hooks/useAssignJudge'
import { useEvent } from '@/hooks/useEvent'
import { useOrganizerJudges } from '@/hooks/useOrganizerJudges'
import { DEFAULT_EVENT_ID } from '../constants'

export default function JudgesPanel() {
  const { data: judges, isLoading } = useOrganizerJudges()
  const { data: event } = useEvent(DEFAULT_EVENT_ID)
  const assignMutation = useAssignJudge()
  const [selectedJudge, setSelectedJudge] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('')

  const handleAssign = async () => {
    if (!selectedJudge || !selectedTrack) {
      toast.error('Select both a judge and a project category')
      return
    }
    try {
      await assignMutation.mutateAsync({ judgeId: selectedJudge, trackId: selectedTrack })
      toast.success('Judge assigned to project category')
      setSelectedJudge('')
      setSelectedTrack('')
    } catch {
      toast.error('Failed to assign judge')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Judges</h2>
        <p className="text-muted-foreground">Manage judge assignments and review progress</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-medium">Assign Judge to Project Category</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Categories map to event tracks (e.g. Generative AI, MLOps). Judges review submissions in
          their assigned category.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="judge-select">
              Judge
            </label>
            <Select value={selectedJudge} onValueChange={setSelectedJudge}>
              <SelectTrigger id="judge-select">
                <SelectValue placeholder="Select judge" />
              </SelectTrigger>
              <SelectContent>
                {(judges ?? []).map((judge) => (
                  <SelectItem key={judge.id} value={judge.id}>
                    {judge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="track-select">
              Project category (track)
            </label>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger id="track-select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {event?.tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssign} disabled={assignMutation.isPending}>
            Assign
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judge Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Category</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Reviewed</TableHead>
              <TableHead className="text-right">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(judges ?? []).map((judge) => (
              <TableRow key={judge.id}>
                <TableCell className="font-medium">{judge.name}</TableCell>
                <TableCell>{judge.email}</TableCell>
                <TableCell>{judge.assignedTrackName ?? 'Unassigned'}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {judge.assignedProjectCount}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                  {judge.reviewedCount}
                </TableCell>
                <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                  {judge.pendingCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
