import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FileUp,
  Loader2,
  Lock,
  Share2,
  Trophy,
  Upload,
  WifiOff,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ApiClientError } from '@/api/client'
import { Header } from '@/components/layout/Header'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useEvent } from '@/hooks/useEvent'
import { useMySubmission } from '@/hooks/useMySubmission'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { useFinalSubmit } from '@/hooks/useFinalSubmit'
import { useCountdown } from '@/hooks/useCountdown'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Submission } from '@/types'
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const repoUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => /github\.com|gitlab\.com/i.test(url),
    'Must be a GitHub or GitLab URL',
  )

const videoUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => /youtube\.com|youtu\.be|loom\.com/i.test(url),
    'Must be a YouTube or Loom URL',
  )

const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z
    .string()
    .min(100, 'Description must be at least 100 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  techStack: z.array(z.string().min(1)).min(1, 'Add at least one technology'),
  demoUrl: z.string().url('Demo link must be a valid URL'),
  repoUrl: repoUrlSchema,
  pitchDeckUrl: z.string().optional(),
  videoUrl: z.union([videoUrlSchema, z.literal('')]).optional(),
})

type SubmissionFormValues = z.infer<typeof submissionSchema>

const URGENT_THRESHOLD_MS = 30 * 60 * 1000
const MAX_PDF_SIZE = 10 * 1024 * 1024
const AUTO_SAVE_MS = 60_000

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface SubmissionReadOnlyProps {
  submission: Submission
  showActions?: boolean
}

function SubmissionReadOnly({ submission, showActions = true }: SubmissionReadOnlyProps) {
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

interface SubmissionFormProps {
  teamId: string
  initialData?: Submission | null
  disabled?: boolean
  onSubmitRequest: (values: SubmissionFormValues) => void
  isSubmitting?: boolean
}

function SubmissionForm({
  teamId,
  initialData,
  disabled,
  onSubmitRequest,
  isSubmitting,
}: SubmissionFormProps) {
  const { saveMutation, uploadMutation } = useSaveSubmission()
  const isOnline = useOnlineStatus()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pitchFileName, setPitchFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [uploadFailed, setUploadFailed] = useState(false)
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const draftRestoredRef = useRef(false)
  const wasOfflineRef = useRef(false)

  const draftKey = `submission-draft-${teamId}`

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      techStack: initialData?.techStack ?? [],
      demoUrl: initialData?.demoUrl ?? '',
      repoUrl: initialData?.repoUrl ?? '',
      pitchDeckUrl: initialData?.pitchDeckUrl ?? '',
      videoUrl: initialData?.videoUrl ?? '',
    },
    mode: 'onChange',
  })

  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = form

  const formValues = watch()
  const techStack = watch('techStack')
  const description = watch('description')

  const persistLocalDraft = useCallback(() => {
    saveSessionDraft(draftKey, getValues())
  }, [draftKey, getValues])

  useEffect(() => {
    if (disabled || draftRestoredRef.current) return
    const draft = loadSessionDraft<SubmissionFormValues>(draftKey)
    if (!draft) return
    form.reset(draft)
    draftRestoredRef.current = true
    toast.info('Restored your locally saved submission draft')
  }, [disabled, draftKey, form])

  useEffect(() => {
    if (disabled) return
    persistLocalDraft()
  }, [disabled, formValues, persistLocalDraft])

  const saveDraft = useCallback(
    async (options?: { silent?: boolean }) => {
      const values = getValues()
      persistLocalDraft()
      setLastSaved(new Date())

      if (!isOnline) {
        if (!options?.silent) {
          toast.info('Saved locally — will sync when you are back online')
        }
        return
      }

      try {
        await saveMutation.mutateAsync({
          id: initialData?.id,
          title: values.title,
          description: values.description,
          techStack: values.techStack,
          demoUrl: values.demoUrl,
          repoUrl: values.repoUrl,
          pitchDeckUrl: values.pitchDeckUrl || undefined,
          videoUrl: values.videoUrl || undefined,
        })
        if (!options?.silent) {
          toast.success('Draft saved')
        }
      } catch {
        if (!options?.silent) {
          toast.error('Failed to save draft to server — your work is saved locally')
        }
      }
    },
    [getValues, initialData?.id, isOnline, persistLocalDraft, saveMutation],
  )

  useEffect(() => {
    if (disabled) return
    autoSaveRef.current = setInterval(() => {
      void saveDraft({ silent: true })
    }, AUTO_SAVE_MS)
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [disabled, saveDraft])

  useEffect(() => {
    if (disabled) return

    const handleVisibility = () => {
      if (document.hidden) {
        void saveDraft({ silent: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [disabled, saveDraft])

  useEffect(() => {
    if (disabled) return
    if (!isOnline) {
      wasOfflineRef.current = true
      return
    }
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false
      void saveDraft({ silent: true })
      toast.success('Back online — syncing your draft')
    }
  }, [disabled, isOnline, saveDraft])

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag) return
    if (techStack.includes(tag)) return
    setValue('techStack', [...techStack, tag], { shouldValidate: true })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setValue(
      'techStack',
      techStack.filter((t) => t !== tag),
      { shouldValidate: true },
    )
  }

  const handlePitchUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      toast.error('File must be under 10MB')
      return
    }

    setUploadFailed(false)
    setPendingUploadFile(null)
    setPitchFileName(file.name)
    setUploadProgress(10)

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 15, 90))
    }, 200)

    try {
      const result = await retryWithBackoff(
        () => uploadMutation.mutateAsync({ file, field: 'pitchDeckUrl' }),
        { maxAttempts: 3, baseDelayMs: 2000 },
      )
      clearInterval(progressInterval)
      setUploadProgress(100)
      setValue('pitchDeckUrl', result.url, { shouldValidate: true })
      persistLocalDraft()
      toast.success('Pitch deck uploaded')
    } catch {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setPitchFileName(null)
      setUploadFailed(true)
      setPendingUploadFile(file)
      toast.error('Upload failed after 3 attempts')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handlePitchUpload(file)
  }

  const clearPitchDeck = () => {
    setValue('pitchDeckUrl', '', { shouldValidate: true })
    setPitchFileName(null)
    setUploadProgress(0)
    setUploadFailed(false)
    setPendingUploadFile(null)
    persistLocalDraft()
  }

  return (
    <form
      className="space-y-8 pb-28"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmitRequest(getValues())
      }}
    >
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>No connection</AlertTitle>
          <AlertDescription>
            Your work is saved locally. We&apos;ll sync when you&apos;re back online.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          {...register('title')}
          disabled={disabled}
          onBlur={() => void saveDraft({ silent: true })}
          placeholder="e.g. ContextHub — Inline Dev Context"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project Description *</Label>
        <p className="text-xs text-muted-foreground">
          Include what problem you&apos;re solving, how your solution works, and its impact.
        </p>
        <Textarea
          id="description"
          {...register('description')}
          disabled={disabled}
          onBlur={() => void saveDraft({ silent: true })}
          rows={8}
          placeholder="Describe your project..."
          aria-invalid={Boolean(errors.description)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {errors.description && (
              <span className="text-destructive">{errors.description.message}</span>
            )}
          </span>
          <span>{description?.length ?? 0} / 2000</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tech-stack">Tech Stack *</Label>
        <div className="flex flex-wrap gap-2 rounded-md border p-3">
          {techStack.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {!disabled && (
            <Input
              id="tech-stack"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
              onBlur={() => {
                addTag(tagInput)
                void saveDraft({ silent: true })
              }}
              placeholder="Type and press Enter"
              className="h-8 min-w-[140px] flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          )}
        </div>
        {errors.techStack && <p className="text-sm text-destructive">{errors.techStack.message}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="demoUrl">Demo Link *</Label>
          <Input
            id="demoUrl"
            type="url"
            {...register('demoUrl')}
            disabled={disabled}
            onBlur={() => void saveDraft({ silent: true })}
            placeholder="https://your-demo.vercel.app"
          />
          {errors.demoUrl && <p className="text-sm text-destructive">{errors.demoUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub / GitLab Repo *</Label>
          <Input
            id="repoUrl"
            type="url"
            {...register('repoUrl')}
            disabled={disabled}
            onBlur={() => void saveDraft({ silent: true })}
            placeholder="https://github.com/org/repo"
          />
          {errors.repoUrl && <p className="text-sm text-destructive">{errors.repoUrl.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pitch Deck (PDF, max 10MB)</Label>
        {uploadFailed && pendingUploadFile ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Failed to upload <strong>{pendingUploadFile.name}</strong>. Please try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void handlePitchUpload(pendingUploadFile)}
            >
              Try again
            </Button>
          </div>
        ) : watch('pitchDeckUrl') || pitchFileName ? (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{pitchFileName ?? 'Pitch deck uploaded'}</span>
              </div>
              {!disabled && (
                <Button type="button" variant="ghost" size="sm" onClick={clearPitchDeck}>
                  Remove
                </Button>
              )}
            </div>
            {uploadMutation.isPending && <Progress value={uploadProgress} className="mt-3 h-2" />}
          </div>
        ) : (
          !disabled && (
            <div
              className="relative"
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                )}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">Drag & drop your PDF here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handlePitchUpload(file)
                }}
                aria-label="Upload pitch deck PDF"
              />
            </div>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Demo Video Link (optional)</Label>
        <Input
          id="videoUrl"
          type="url"
          {...register('videoUrl')}
          disabled={disabled}
          onBlur={() => void saveDraft({ silent: true })}
          placeholder="https://youtube.com/watch?v=... or loom.com/share/..."
        />
        {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl.message}</p>}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 p-4 backdrop-blur md:left-60"
        role="toolbar"
        aria-label="Submission actions"
      >
        <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {lastSaved
              ? `Draft saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
              : 'Auto-saves every 60 seconds'}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={disabled || saveMutation.isPending}
              onClick={() => void saveDraft()}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save Draft
            </Button>
            <Button type="submit" disabled={disabled || !isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                'Submit Project'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
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
