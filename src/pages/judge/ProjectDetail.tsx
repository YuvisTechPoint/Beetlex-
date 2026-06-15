import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ExternalLink, FileText, Loader2, Video } from 'lucide-react'
import { toast } from 'sonner'
import type { JudgeQueueItem } from '@/api/judges'
import { ScoreConfirmationDialog } from '@/pages/judge/ScoreConfirmationDialog'
import {
  DEFAULT_SCORE_VALUES,
  SCORE_CRITERIA,
  computeTotalScore,
  scoringSchema,
  type ScoringFormValues,
} from '@/pages/judge/schemas'
import { useJudgeSubmission } from '@/hooks/useJudgeSubmission'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

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
}

export function ProjectDetail({ submissionId, queueItem, onScored }: ProjectDetailProps) {
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
          {isAlreadyScored && (
            <Badge variant="secondary">Previously scored</Badge>
          )}
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
                <p className="text-2xl font-bold tabular-nums">{totalScore}<span className="text-base font-normal text-muted-foreground">/40</span></p>
              </div>
            </div>

            <p className="mb-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Score guide: 1–3 weak · 4–6 average · 7–8 good · 9–10 exceptional
            </p>

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
          </div>
        </div>
      </div>

      {pendingValues && (
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
