import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Submission } from '@/types'
import { loadSessionDraft, saveSessionDraft } from '@/lib/sessionDraft'
import { AUTO_SAVE_MS } from './constants'
import { submissionSchema, type SubmissionFormValues } from './schemas'
import { usePitchDeckUpload } from './usePitchDeckUpload'

interface UseSubmissionFormOptions {
  teamId: string
  initialData?: Submission | null
  disabled?: boolean
}

export function useSubmissionForm({ teamId, initialData, disabled }: UseSubmissionFormOptions) {
  const { saveMutation } = useSaveSubmission()
  const isOnline = useOnlineStatus()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [tagInput, setTagInput] = useState('')
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
  const pitchDeckUrl = watch('pitchDeckUrl')

  const persistLocalDraft = useCallback(() => {
    saveSessionDraft(draftKey, getValues())
  }, [draftKey, getValues])

  const upload = usePitchDeckUpload({
    onUploaded: (url) => setValue('pitchDeckUrl', url, { shouldValidate: true }),
    persistLocalDraft,
  })

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

  const clearPitchDeck = () => {
    setValue('pitchDeckUrl', '', { shouldValidate: true })
    upload.resetUploadState()
    persistLocalDraft()
  }

  const onBlurSave = () => void saveDraft({ silent: true })

  return {
    register,
    errors,
    isValid,
    getValues,
    isOnline,
    lastSaved,
    techStack,
    description,
    pitchDeckUrl,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    saveDraft,
    onBlurSave,
    clearPitchDeck,
    isSaving: saveMutation.isPending,
    ...upload,
  }
}

export function getSubmissionDraftKey(teamId: string) {
  return `submission-draft-${teamId}`
}

export { clearSessionDraft } from '@/lib/sessionDraft'
