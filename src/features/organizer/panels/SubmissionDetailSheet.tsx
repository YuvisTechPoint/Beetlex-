import { ExternalLink } from 'lucide-react'
import type { OrganizerSubmissionSummary } from '@/api/organizer'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SUBMISSION_STATUS_STYLES } from './submissionsConstants'

type SubmissionDetailSheetProps = {
  submission: OrganizerSubmissionSummary | null
  onClose: () => void
}

export function SubmissionDetailSheet({ submission, onClose }: SubmissionDetailSheetProps) {
  return (
    <Sheet open={Boolean(submission)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {submission && (
          <>
            <SheetHeader>
              <SheetTitle>{submission.title}</SheetTitle>
              <SheetDescription>
                {submission.teamName} · {submission.trackName}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4 text-sm">
              <p className="text-muted-foreground">{submission.description}</p>
              <div className="flex flex-wrap gap-2">
                {submission.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Demo <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={submission.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Repository <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline" className={SUBMISSION_STATUS_STYLES[submission.status]}>
                      {submission.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg Score</dt>
                  <dd className="font-medium tabular-nums">
                    {submission.averageScore?.toFixed(1) ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Judge Reviews</dt>
                  <dd className="font-medium">{submission.scoreCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assigned Judges</dt>
                  <dd className="font-medium">{submission.assignedJudgeIds.length}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
