import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import type { JudgeQueueItem } from '@/api/judges'
import { Header } from '@/components/layout/Header'
import { useJudgeQueue } from '@/hooks/useJudgeQueue'
import { useJudgeSubmission } from '@/hooks/useJudgeSubmission'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// --- Scoring schema & helpers ---

const scoreField = z
  .number({ message: 'Score is required' })
  .int()
  .min(1, 'Minimum score is 1')
  .max(10, 'Maximum score is 10')

const scoringSchema = z.object({
  innovation: scoreField,
  technicalExecution: scoreField,
  impact: scoreField,
  presentation: scoreField,
  comments: z
    .string()
    .min(20, 'Comments must be at least 20 characters')
    .max(1000, 'Comments must be at most 1000 characters'),
})

type ScoringFormValues = z.infer<typeof scoringSchema>

const SCORE_CRITERIA = [
  {
    key: 'innovation' as const,
    label: 'Innovation',
    description: 'Novelty of the idea and creative problem-solving approach',
  },
  {
    key: 'technicalExecution' as const,
    label: 'Technical Execution',
    description: 'Code quality, architecture, and implementation depth',
  },
  {
    key: 'impact' as const,
    label: 'Impact',
    description: 'Potential real-world value and problem significance',
  },
  {
    key: 'presentation' as const,
    label: 'Presentation',
    description: 'Clarity of demo, pitch, and overall communication',
  },
] as const

function computeTotalScore(
  values: Pick<ScoringFormValues, 'innovation' | 'technicalExecution' | 'impact' | 'presentation'>,
) {
  return values.innovation + values.technicalExecution + values.impact + values.presentation
}

const DEFAULT_SCORE_VALUES: ScoringFormValues = {
  innovation: 5,
  technicalExecution: 5,
  impact: 5,
  presentation: 5,
  comments: '',
}

// --- Review queue ---

type QueueFilter = 'all' | 'pending' | 'completed'

interface ReviewQueueProps {
  items: JudgeQueueItem[]
  selectedId: string | null
  filter: QueueFilter
  onFilterChange: (filter: QueueFilter) => void
  onSelect: (submissionId: string) => void
  isLoading?: boolean
}

function filterItems(items: JudgeQueueItem[], filter: QueueFilter) {
  switch (filter) {
    case 'pending':
      return items.filter((item) => !item.scored)
    case 'completed':
      return items.filter((item) => item.scored)
    default:
      return items
  }
}

function ReviewQueue({
  items,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  isLoading,
}: ReviewQueueProps) {
  const scoredCount = items.filter((item) => item.scored).length
  const progress = items.length > 0 ? Math.round((scoredCount / items.length) * 100) : 0
  const filtered = filterItems(items, filter)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">Review progress</h2>
          <span className="text-sm text-muted-foreground">
            {scoredCount} of {items.length} reviewed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as QueueFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({items.length - scoredCount})
          </TabsTrigger>
          <TabsTrigger value="completed">Done ({scoredCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">No submissions here</p>
            <p className="text-xs text-muted-foreground">
              {filter === 'pending' ? 'All caught up!' : 'Try a different filter'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.submissionId}
              type="button"
              onClick={() => onSelect(item.submissionId)}
              className="w-full text-left"
            >
              <Card
                className={cn(
                  'transition-colors hover:bg-muted/50',
                  selectedId === item.submissionId && 'border-primary ring-1 ring-primary',
                )}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{item.teamName}</p>
                    </div>
                    {item.scored ? (
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Scored
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.trackName}</Badge>
                    {item.submittedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// --- Score confirmation dialog ---

interface ScoreConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTitle: string
  teamName: string
  values: ScoringFormValues
  onConfirm: () => void
  isSubmitting?: boolean
  isOverwrite?: boolean
}

function ScoreConfirmationDialog({
  open,
  onOpenChange,
  projectTitle,
  teamName,
  values,
  onConfirm,
  isSubmitting,
  isOverwrite,
}: ScoreConfirmationDialogProps) {
  const total = computeTotalScore(values)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isOverwrite ? 'Overwrite existing score?' : 'Confirm score submission'}</DialogTitle>
          <DialogDescription>
            {isOverwrite ? (
              <>
                You have already scored this project. Submitting again will{' '}
                <strong>permanently replace</strong> your previous score for{' '}
                <span className="font-medium text-foreground">{projectTitle}</span>.
              </>
            ) : (
              <>
                Review your scores for{' '}
                <span className="font-medium text-foreground">{projectTitle}</span> by {teamName}. This
                action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {SCORE_CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">{values[key]} / 10</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total score</span>
            <span className="text-lg font-semibold tabular-nums">{total} / 40</span>
          </div>
          {values.comments && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Comments</p>
              <p className="text-sm leading-relaxed">{values.comments}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Go back
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Submit score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Project detail ---

function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`

  const loomMatch = url.match(/loom\.com\/share\/([^?/]+)/)
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`

  return null
}

interface ProjectDetailProps {
  submissionId: string
  queueItem?: JudgeQueueItem
  onScored?: () => void
  readOnly?: boolean
}

export function ProjectDetail({
  submissionId,
  queueItem,
  onScored,
  readOnly = false,
}: ProjectDetailProps) {
  const { user } = useAuth()
  const { data: submission, isLoading, isError } = useJudgeSubmission(submissionId)
  const submitScore = useSubmitScore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<ScoringFormValues | null>(null)

  const existingScore = useMemo(() => {
    if (!submission?.scores || !user) return null
    return submission.scores.find((s) => s.judgeId === user.id) ?? null
  }, [submission?.scores, user])

  const form = useForm<ScoringFormValues>({
    resolver: zodResolver(scoringSchema),
    defaultValues: DEFAULT_SCORE_VALUES,
    mode: 'onChange',
  })

  const watched = form.watch()
  const totalScore = computeTotalScore(watched)
  const isAlreadyScored = Boolean(existingScore)

  useEffect(() => {
    if (existingScore) {
      form.reset({
        innovation: existingScore.innovation,
        technicalExecution: existingScore.technicalExecution,
        impact: existingScore.impact,
        presentation: existingScore.presentation,
        comments: existingScore.comments,
      })
    } else {
      form.reset(DEFAULT_SCORE_VALUES)
    }
  }, [existingScore, submissionId, form])

  const handleValidateAndConfirm = form.handleSubmit((values) => {
    setPendingValues(values)
    setConfirmOpen(true)
  })

  const handleConfirmSubmit = async () => {
    if (!pendingValues) return
    try {
      await submitScore.mutateAsync({
        submissionId,
        ...pendingValues,
      })
      toast.success(isAlreadyScored ? 'Score updated' : 'Score submitted')
      setConfirmOpen(false)
      setPendingValues(null)
      onScored?.()
    } catch {
      toast.error('Failed to submit score')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !submission) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">Unable to load submission details.</p>
      </div>
    )
  }

  const videoEmbed = submission.videoUrl ? getVideoEmbedUrl(submission.videoUrl) : null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">{submission.title}</h2>
            <p className="text-sm text-muted-foreground">
              {queueItem?.teamName ?? 'Team'} · {queueItem?.trackName ?? 'Track'}
            </p>
          </div>
          {readOnly ? (
            <Badge variant="outline">Read-only review</Badge>
          ) : isAlreadyScored ? (
            <Badge variant="secondary">Previously scored</Badge>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4">
          <Tabs defaultValue="overview">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="pitch" className="flex-1" disabled={!submission.pitchDeckUrl}>
                Pitch Deck
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1" disabled={!submission.videoUrl}>
                Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
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
            </TabsContent>

            <TabsContent value="pitch" className="mt-4">
              {submission.pitchDeckUrl ? (
                <div className="overflow-hidden rounded-lg border">
                  <iframe
                    src={submission.pitchDeckUrl}
                    title={`${submission.title} pitch deck`}
                    className="h-[min(60vh,480px)] w-full"
                  />
                  <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <a
                      href={submission.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open pitch deck in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No pitch deck provided.</p>
              )}
            </TabsContent>

            <TabsContent value="video" className="mt-4">
              {submission.videoUrl ? (
                videoEmbed ? (
                  <div className="overflow-hidden rounded-lg border">
                    <div className="aspect-video">
                      <iframe
                        src={videoEmbed}
                        title={`${submission.title} demo video`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border p-4">
                    <Video className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open video in new tab
                    </a>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">No demo video provided.</p>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scoring rubric</h3>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total score</p>
                <p className="text-2xl font-bold tabular-nums">
                  {readOnly && existingScore
                    ? computeTotalScore({
                        innovation: existingScore.innovation,
                        technicalExecution: existingScore.technicalExecution,
                        impact: existingScore.impact,
                        presentation: existingScore.presentation,
                      })
                    : totalScore}
                  <span className="text-base font-normal text-muted-foreground">/40</span>
                </p>
              </div>
            </div>

            <p className="mb-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Score guide: 1–3 weak · 4–6 average · 7–8 good · 9–10 exceptional
            </p>

            {readOnly ? (
              existingScore ? (
                <div className="space-y-5">
                  {SCORE_CRITERIA.map(({ key, label, description }) => (
                    <div key={key} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <span className="text-lg font-semibold tabular-nums">
                          {existingScore[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Judge comments</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {existingScore.comments}
                    </p>
                    {existingScore.submittedAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Scored {format(new Date(existingScore.submittedAt), 'PPpp')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No score recorded for this submission.</p>
              )
            ) : (
            <Form {...form}>
              <form onSubmit={handleValidateAndConfirm} className="space-y-6">
                {SCORE_CRITERIA.map(({ key, label, description }) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>{label}</FormLabel>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                          <span className="text-lg font-semibold tabular-nums">{field.value}</span>
                        </div>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(v) => field.onChange(v[0])}
                            aria-label={`${label} score`}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>10</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judge comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share constructive feedback for the team (min. 20 characters)..."
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitScore.isPending || !form.formState.isValid}
                >
                  {submitScore.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {isAlreadyScored ? 'Update score' : 'Submit score'}
                </Button>
              </form>
            </Form>
            )}
          </div>
        </div>
      </div>

      {!readOnly && pendingValues && (
        <ScoreConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          projectTitle={submission.title}
          teamName={queueItem?.teamName ?? 'Team'}
          values={pendingValues}
          onConfirm={handleConfirmSubmit}
          isSubmitting={submitScore.isPending}
          isOverwrite={isAlreadyScored}
        />
      )}
    </div>
  )
}

// --- Dashboard page ---

function subscribeToDesktop(cb: () => void) {
  const mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getDesktopSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches
}

function getServerSnapshot() {
  return true
}

export default function JudgeDashboardPage() {
  const { data: queue = [], isLoading } = useJudgeQueue()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerSnapshot)

  const pendingItems = useMemo(() => queue.filter((item) => !item.scored), [queue])
  const effectiveSelectedId = selectedId ?? pendingItems[0]?.submissionId ?? null

  const selectedItem = queue.find((item) => item.submissionId === effectiveSelectedId)

  const handleSelect = (submissionId: string) => {
    setSelectedId(submissionId)
    if (!isDesktop) {
      setMobileOpen(true)
    }
  }

  const handleScored = () => {
    if (!isDesktop) {
      setMobileOpen(false)
    }
    const nextPending = queue.find((item) => !item.scored && item.submissionId !== selectedId)
    if (nextPending) {
      setSelectedId(nextPending.submissionId)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Judge Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Review submissions and submit your scores
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/judge/completed">
              <ClipboardList className="mr-2 h-4 w-4" aria-hidden="true" />
              Completed reviews
            </Link>
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:gap-4">
          <div className="min-h-[400px] lg:min-h-0">
            <ReviewQueue
              items={queue}
              selectedId={effectiveSelectedId}
              filter={filter}
              onFilterChange={setFilter}
              onSelect={handleSelect}
              isLoading={isLoading}
            />
          </div>

          <div
            className={cn(
              'hidden min-h-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:block',
            )}
          >
            {effectiveSelectedId ? (
              <ProjectDetail
                submissionId={effectiveSelectedId}
                queueItem={selectedItem}
                onScored={handleScored}
              />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a submission from the queue to begin reviewing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>Submission review</SheetTitle>
          </SheetHeader>
          {effectiveSelectedId && (
            <ProjectDetail
              submissionId={effectiveSelectedId}
              queueItem={selectedItem}
              onScored={handleScored}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
