import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Submission } from '@/types'

interface ProjectOverviewTabProps {
  submission: Submission
}

export function ProjectOverviewTab({ submission }: ProjectOverviewTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {submission.description}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Tech stack</h3>
        <div className="flex flex-wrap gap-2">
          {submission.techStack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={submission.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Demo
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href={submission.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Repository
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {submission.submittedAt && (
        <p className="text-xs text-muted-foreground">
          Submitted {format(new Date(submission.submittedAt), 'PPpp')}
        </p>
      )}
    </div>
  )
}
