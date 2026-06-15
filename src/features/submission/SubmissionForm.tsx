import { WifiOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Submission } from '@/types'
import { SubmissionFormFields } from './SubmissionFormFields'
import { SubmitFooter } from './SubmitFooter'
import { UploadPanel } from './UploadPanel'
import type { SubmissionFormValues } from './schemas'
import { useSubmissionForm } from './useSubmissionForm'

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
  const form = useSubmissionForm({ teamId, initialData, disabled })

  return (
    <form
      className="space-y-8 pb-28"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmitRequest(form.getValues())
      }}
    >
      {!form.isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>No connection</AlertTitle>
          <AlertDescription>
            Your work is saved locally. We&apos;ll sync when you&apos;re back online.
          </AlertDescription>
        </Alert>
      )}

      <SubmissionFormFields
        register={form.register}
        errors={form.errors}
        disabled={disabled}
        techStack={form.techStack}
        description={form.description}
        tagInput={form.tagInput}
        onTagInputChange={form.setTagInput}
        onAddTag={form.addTag}
        onRemoveTag={form.removeTag}
        onBlurSave={form.onBlurSave}
      />

      <UploadPanel
        disabled={disabled}
        pitchDeckUrl={form.pitchDeckUrl}
        pitchFileName={form.pitchFileName}
        uploadProgress={form.uploadProgress}
        uploadFailed={form.uploadFailed}
        pendingUploadFile={form.pendingUploadFile}
        isUploading={form.isUploading}
        dragOver={form.dragOver}
        onDragOver={(e) => {
          e.preventDefault()
          form.setDragOver(true)
        }}
        onDragLeave={() => form.setDragOver(false)}
        onDrop={form.onDrop}
        onFileSelect={(file) => void form.handlePitchUpload(file)}
        onRetryUpload={() => {
          if (form.pendingUploadFile) void form.handlePitchUpload(form.pendingUploadFile)
        }}
        onClear={form.clearPitchDeck}
      />

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Demo Video Link (optional)</Label>
        <Input
          id="videoUrl"
          type="url"
          {...form.register('videoUrl')}
          disabled={disabled}
          onBlur={form.onBlurSave}
          placeholder="https://youtube.com/watch?v=... or loom.com/share/..."
        />
        {form.errors.videoUrl && (
          <p className="text-sm text-destructive">{form.errors.videoUrl.message}</p>
        )}
      </div>

      <SubmitFooter
        lastSaved={form.lastSaved}
        disabled={disabled}
        isValid={form.isValid}
        isSubmitting={isSubmitting}
        isSaving={form.isSaving}
        onSaveDraft={() => void form.saveDraft()}
      />
    </form>
  )
}
