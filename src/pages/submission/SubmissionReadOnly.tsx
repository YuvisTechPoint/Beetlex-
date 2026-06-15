import { format } from 'date-fns'
import { ExternalLink, FileText, Share2, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Submission } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SubmissionReadOnlyProps {
  submission: Submission
  showActions?: boolean
}

export function SubmissionReadOnly({ submission, showActions = true }: SubmissionReadOnlyProps) {
  const shareProject = async () => {
    const text = `${submission.title} — ${submission.demoUrl}`
    if (navigator.share) {
      await navigator.share({ title: submission.title, text, url: submission.demoUrl })
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Project link copied to clipboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{submission.title}</CardTitle>
            {submission.submittedAt && (
              <CardDescription>
                Submitted {format(new Date(submission.submittedAt), 'PPpp')}
              </CardDescription>
            )}
          </div>
          <Badge variant={submission.isDraft ? 'secondary' : 'default'}>
            {submission.isDraft ? 'Draft' : 'Final'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
          <p className="whitespace-pre-wrap leading-relaxed">{submission.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {submission.techStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">Demo</h3>
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {submission.demoUrl}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">Repository</h3>
            <a
              href={submission.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {submission.repoUrl}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          {submission.pitchDeckUrl && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">Pitch Deck</h3>
              <a
                href={submission.pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                View PDF
              </a>
            </div>
          )}
          {submission.videoUrl && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">Demo Video</h3>
              <a
                href={submission.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Watch video
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        {showActions && !submission.isDraft && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard?tab=leaderboard">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                View on Leaderboard
              </Link>
            </Button>
            <Button variant="outline" onClick={shareProject}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
