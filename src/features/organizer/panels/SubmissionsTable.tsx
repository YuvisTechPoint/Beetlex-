import { UserPlus } from 'lucide-react'
import type { OrganizerJudge, OrganizerSubmissionSummary } from '@/api/organizer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils'
import { SUBMISSION_STATUS_STYLES } from './submissionsConstants'

type SubmissionsTableProps = {
  submissions: OrganizerSubmissionSummary[]
  judges: OrganizerJudge[] | undefined
  assigningId: string | null
  onView: (submission: OrganizerSubmissionSummary) => void
  onToggleAssign: (submissionId: string) => void
  onAssign: (submissionId: string, judgeId: string) => void
}

export function SubmissionsTable({
  submissions,
  judges,
  assigningId,
  onView,
  onToggleAssign,
  onAssign,
}: SubmissionsTableProps) {
  return (
    <div className="mobile-scroll-x overflow-hidden rounded-lg border sm:overflow-hidden">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Project Title</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">{submission.teamName}</TableCell>
              <TableCell className="max-w-[200px] truncate">{submission.title}</TableCell>
              <TableCell className="max-w-[120px] truncate">{submission.trackName}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(SUBMISSION_STATUS_STYLES[submission.status])}
                >
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {submission.averageScore != null ? submission.averageScore.toFixed(1) : '—'}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(submission)}>
                    View
                  </Button>
                  {!submission.isDraft && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAssign(submission.id)}
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
                {assigningId === submission.id && (
                  <div className="mt-2 flex justify-end gap-2">
                    <Select onValueChange={(judgeId) => onAssign(submission.id, judgeId)}>
                      <SelectTrigger className="h-8 w-44">
                        <SelectValue placeholder="Assign judge" />
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
