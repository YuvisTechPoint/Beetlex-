import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDistanceToNow } from 'date-fns'
import { FileUp, Loader2, Upload, WifiOff, X } from 'lucide-react'
import { toast } from 'sonner'
import { submissionSchema, type SubmissionFormValues } from '@/pages/submission/schemas'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Submission } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { retryWithBackoff } from '@/lib/retry'
import { cn } from '@/lib/utils'

const MAX_PDF_SIZE = 10 * 1024 * 1024
const AUTO_SAVE_MS = 60_000

interface SubmissionFormProps {
  teamId: string
  initialData?: Submission | null
  disabled?: boolean
  onSubmitRequest: (values: SubmissionFormValues) => void
  isSubmitting?: boolean
}

export function SubmissionForm({
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
