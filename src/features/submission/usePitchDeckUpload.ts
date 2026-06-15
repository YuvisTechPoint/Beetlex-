import { useState } from 'react'
import { toast } from 'sonner'
import { useSaveSubmission } from '@/hooks/useSaveSubmission'
import { retryWithBackoff } from '@/lib/retry'
import { MAX_PDF_SIZE } from './constants'

interface UsePitchDeckUploadOptions {
  onUploaded: (url: string) => void
  persistLocalDraft: () => void
}

export function usePitchDeckUpload({ onUploaded, persistLocalDraft }: UsePitchDeckUploadOptions) {
  const { uploadMutation } = useSaveSubmission()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pitchFileName, setPitchFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadFailed, setUploadFailed] = useState(false)
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null)

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
      onUploaded(result.url)
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

  const resetUploadState = () => {
    setPitchFileName(null)
    setUploadProgress(0)
    setUploadFailed(false)
    setPendingUploadFile(null)
  }

  return {
    uploadProgress,
    pitchFileName,
    dragOver,
    uploadFailed,
    pendingUploadFile,
    isUploading: uploadMutation.isPending,
    setDragOver,
    onDrop,
    handlePitchUpload,
    resetUploadState,
    setPitchFileName,
  }
}
