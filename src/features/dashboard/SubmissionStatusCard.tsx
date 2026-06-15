import { Link } from 'react-router-dom'
import { Check, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type SubmissionStatus = 'not_started' | 'draft' | 'submitted'

interface SubmissionStatusCardProps {
  submissionStatus: SubmissionStatus
  teamFormed: boolean
}

export function SubmissionStatusCard({ submissionStatus, teamFormed }: SubmissionStatusCardProps) {
  const trackerSteps = [
    { label: 'Team Formed', done: teamFormed },
    {
      label: 'Project Started',
      done: submissionStatus === 'draft' || submissionStatus === 'submitted',
      active: submissionStatus === 'draft',
    },
    { label: 'Submitted', done: submissionStatus === 'submitted' },
  ]

  const progressValue =
    submissionStatus === 'submitted' ? 100 : submissionStatus === 'draft' ? 66 : teamFormed ? 33 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Progress</CardTitle>
        <CardDescription>Track your team&apos;s journey to final submission</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progressValue} className="h-2" />
        <div className="grid gap-4 sm:grid-cols-3">
          {trackerSteps.map((step, index) => (
            <div
              key={step.label}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-4 transition-colors',
                step.done && 'border-primary/30 bg-primary/5',
                step.active && 'ring-2 ring-primary/20',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  step.done ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
              >
                {step.done ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : step.active ? (
                  <Circle className="h-4 w-4 animate-pulse" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                {step.active && <p className="text-xs text-primary">In progress</p>}
              </div>
            </div>
          ))}
        </div>
        {submissionStatus !== 'submitted' && (
          <Button asChild>
            <Link to="/dashboard/submit">
              {submissionStatus === 'draft' ? 'Continue Submission' : 'Start Submission'}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
