import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2, Clock, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { ApiClientError } from '@/api/client'
import { Header } from '@/components/layout/Header'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useEvent } from '@/hooks/useEvent'
import { useMySubmission } from '@/hooks/useMySubmission'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { useFinalSubmit } from '@/hooks/useFinalSubmit'
import { useCountdown } from '@/hooks/useCountdown'
import { SubmissionForm } from '@/pages/submission/SubmissionForm'
import { SubmissionReadOnly } from '@/pages/submission/SubmissionReadOnly'
import type { SubmissionFormValues } from '@/pages/submission/schemas'
import { clearSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const URGENT_THRESHOLD_MS = 30 * 60 * 1000

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function SubmissionPage() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const { data: event, isLoading: eventLoading } = useEvent(team?.eventId)
  const { data: submission, isLoading: submissionLoading, refetch } = useMySubmission()
  const { saveMutation } = useSaveSubmission()
  const finalSubmitMutation = useFinalSubmit()
  const countdown = useCountdown(event?.submissionDeadline)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<SubmissionFormValues | null>(null)
  const [deadlineForced, setDeadlineForced] = useState(false)

  const isLoading = teamLoading || eventLoading || submissionLoading
  const isDeadlinePassed = countdown.isExpired || deadlineForced
  const isUrgent = !isDeadlinePassed && countdown.totalMs < URGENT_THRESHOLD_MS
  const isSubmitted = submission && !submission.isDraft

  const handleSubmitRequest = (values: SubmissionFormValues) => {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingValues || !team) return
    try {
      const saved = await saveMutation.mutateAsync({
        id: submission?.id,
        title: pendingValues.title,
        description: pendingValues.description,
        techStack: pendingValues.techStack,
        demoUrl: pendingValues.demoUrl,
        repoUrl: pendingValues.repoUrl,
        pitchDeckUrl: pendingValues.pitchDeckUrl || undefined,
        videoUrl: pendingValues.videoUrl || undefined,
      })

      await retryWithBackoff(() => finalSubmitMutation.mutateAsync(saved.id), {
        maxAttempts: 3,
        baseDelayMs: 3000,
        jitterMs: 500,
      })

      clearSessionDraft(`submission-draft-${team.id}`)
      await refetch()
      setConfirmOpen(false)
      setPendingValues(null)
      toast.success('Project submitted successfully!')
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'DEADLINE_PASSED') {
        setDeadlineForced(true)
        setConfirmOpen(false)
        setPendingValues(null)
        await refetch()
        toast.error('The submission deadline has passed.')
        return
      }
      toast.error('Failed to submit project. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto max-w-3xl space-y-4 px-4 py-8">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!team || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not registered</AlertTitle>
            <AlertDescription>
              You need to join a team before submitting a project.{' '}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link to="/events">Browse events</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto max-w-3xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project Submission</h1>
            <p className="text-sm text-muted-foreground">{event.title}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {isDeadlinePassed ? (
          <Alert variant="destructive" className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertTitle>Submissions are now closed</AlertTitle>
            <AlertDescription>
              Submissions closed on {format(new Date(event.submissionDeadline), 'PPpp')}.
            </AlertDescription>
          </Alert>
        ) : (
          <div
            className={cn(
              'mb-6 flex items-center gap-3 rounded-lg border px-4 py-3',
              isUrgent
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : 'border-border bg-muted/50',
            )}
            aria-live="polite"
          >
            <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Submission closes in:</p>
              <p
                className={cn(
                  'font-mono text-lg font-bold tabular-nums',
                  isUrgent && 'text-destructive',
                )}
              >
                {pad(countdown.days * 24 + countdown.hours)}:{pad(countdown.minutes)}:
                {pad(countdown.seconds)}
              </p>
            </div>
          </div>
        )}

        {isSubmitted && submission ? (
          <SubmissionReadOnly submission={submission} />
        ) : isDeadlinePassed ? (
          submission ? (
            submission.isDraft ? (
              <div className="space-y-6">
                <Alert variant="destructive">
                  <AlertTitle>Draft not submitted</AlertTitle>
                  <AlertDescription>
                    Your draft was not submitted. The submission period has ended.
                  </AlertDescription>
                </Alert>
                <SubmissionReadOnly submission={submission} showActions={false} />
              </div>
            ) : (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Project submitted</AlertTitle>
                  <AlertDescription>
                    Your project was submitted at{' '}
                    {submission.submittedAt
                      ? format(new Date(submission.submittedAt), 'PPpp')
                      : 'before the deadline'}
                    .
                  </AlertDescription>
                </Alert>
                <SubmissionReadOnly submission={submission} showActions={false} />
              </div>
            )
          ) : (
            <Alert>
              <AlertTitle>No submission</AlertTitle>
              <AlertDescription>Your team did not submit a project.</AlertDescription>
            </Alert>
          )
        ) : (
          <SubmissionForm
            teamId={team.id}
            initialData={submission}
            onSubmitRequest={handleSubmitRequest}
            isSubmitting={finalSubmitMutation.isPending || saveMutation.isPending}
          />
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your project?</DialogTitle>
            <DialogDescription>
              You cannot edit after final submission. Please review your details carefully.
            </DialogDescription>
          </DialogHeader>
          {pendingValues && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              <p>
                <span className="font-medium">Title:</span> {pendingValues.title}
              </p>
              <p>
                <span className="font-medium">Tech:</span> {pendingValues.techStack.join(', ')}
              </p>
              <p>
                <span className="font-medium">Demo:</span> {pendingValues.demoUrl}
              </p>
              <p>
                <span className="font-medium">Repo:</span> {pendingValues.repoUrl}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmSubmit()}
              disabled={finalSubmitMutation.isPending}
            >
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
