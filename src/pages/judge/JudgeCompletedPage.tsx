import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowLeft, Eye } from 'lucide-react'
import { getJudgeSubmission } from '@/api/judges'
import { Header } from '@/components/layout/Header'
import { ProjectDetail } from '@/pages/judge/JudgeDashboardPage'
import { useJudgeQueue } from '@/hooks/useJudgeQueue'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function computeTotalScore(values: {
  innovation: number
  technicalExecution: number
  impact: number
  presentation: number
}) {
  return values.innovation + values.technicalExecution + values.impact + values.presentation
}

export default function JudgeCompletedPage() {
  const { user } = useAuth()
  const { data: queue = [], isLoading: queueLoading } = useJudgeQueue()
  const [viewId, setViewId] = useState<string | null>(null)

  const completedItems = useMemo(
    () => queue.filter((item) => item.scored),
    [queue],
  )

  const submissionQueries = useQueries({
    queries: completedItems.map((item) => ({
      queryKey: ['judge', 'submissions', item.submissionId],
      queryFn: () => getJudgeSubmission(item.submissionId),
    })),
  })

  const isLoadingDetails = submissionQueries.some((q) => q.isLoading)
  const isLoading = queueLoading || isLoadingDetails

  const rows = completedItems.map((item, index) => {
    const submission = submissionQueries[index]?.data
    const score = submission?.scores?.find((s) => s.judgeId === user?.id)
    const total = score
      ? computeTotalScore({
          innovation: score.innovation,
          technicalExecution: score.technicalExecution,
          impact: score.impact,
          presentation: score.presentation,
        })
      : null

    return { item, score, total, submittedAt: score?.submittedAt }
  })

  const viewItem = completedItems.find((item) => item.submissionId === viewId)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/judge">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to queue
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Completed reviews</h1>
            <p className="text-sm text-muted-foreground">
              {completedItems.length} submission{completedItems.length !== 1 ? 's' : ''} scored
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : completedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="text-sm font-medium">No completed reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Head back to the queue to score your first submission.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/judge">Go to queue</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead className="text-center">Innovation</TableHead>
                  <TableHead className="text-center">Technical</TableHead>
                  <TableHead className="text-center">Impact</TableHead>
                  <TableHead className="text-center">Presentation</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Scored</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ item, score, total, submittedAt }) => (
                  <TableRow key={item.submissionId}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.teamName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.trackName}</Badge>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {score?.innovation ?? '—'}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {score?.technicalExecution ?? '—'}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {score?.impact ?? '—'}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {score?.presentation ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {total !== null ? `${total}/40` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {submittedAt ? format(new Date(submittedAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewId(item.submissionId)}
                      >
                        <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Sheet open={Boolean(viewId)} onOpenChange={(open) => !open && setViewId(null)}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Review details</SheetTitle>
          </SheetHeader>
          {viewId && viewItem && (
            <ProjectDetail submissionId={viewId} queueItem={viewItem} readOnly />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
