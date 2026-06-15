import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DeadlineBanner } from './DeadlineBanner'
import { SubmissionForm } from './SubmissionForm'
import { SubmissionReadOnly } from './SubmissionReadOnly'
import { SubmitConfirmDialog } from './SubmitConfirmDialog'
import type { SubmissionPageState } from './useSubmissionPage'

export function SubmissionPageContent({
  team,
  event,
  submission,
  countdown,
  isLoading,
  isDeadlinePassed,
  isSubmitted,
  confirmOpen,
  setConfirmOpen,
  pendingValues,
  handleSubmitRequest,
  handleConfirmSubmit,
  isSubmitting,
  isConfirming,
}: SubmissionPageState) {
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Project Submission</h1>
            <p className="truncate text-sm text-muted-foreground">{event.title}</p>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full shrink-0 sm:w-auto">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <DeadlineBanner
          submissionDeadline={event.submissionDeadline}
          countdown={countdown}
          isDeadlinePassed={isDeadlinePassed}
        />

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
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <SubmitConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pendingValues={pendingValues}
        onConfirm={() => void handleConfirmSubmit()}
        isConfirming={isConfirming}
      />
    </div>
  )
}
