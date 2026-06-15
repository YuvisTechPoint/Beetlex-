import { FileUp, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface UploadPanelProps {
  disabled?: boolean
  pitchDeckUrl: string | undefined
  pitchFileName: string | null
  uploadProgress: number
  uploadFailed: boolean
  pendingUploadFile: File | null
  isUploading: boolean
  dragOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (file: File) => void
  onRetryUpload: () => void
  onClear: () => void
}

export function UploadPanel({
  disabled,
  pitchDeckUrl,
  pitchFileName,
  uploadProgress,
  uploadFailed,
  pendingUploadFile,
  isUploading,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRetryUpload,
  onClear,
}: UploadPanelProps) {
  return (
    <div className="space-y-2">
      <Label>Pitch Deck (PDF, max 10MB)</Label>
      {uploadFailed && pendingUploadFile ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Failed to upload <strong>{pendingUploadFile.name}</strong>. Please try again.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetryUpload}>
            Try again
          </Button>
        </div>
      ) : pitchDeckUrl || pitchFileName ? (
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FileUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{pitchFileName ?? 'Pitch deck uploaded'}</span>
            </div>
            {!disabled && (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Remove
              </Button>
            )}
          </div>
          {isUploading && <Progress value={uploadProgress} className="mt-3 h-2" />}
        </div>
      ) : (
        !disabled && (
          <div
            className="relative"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 py-8 transition-colors',
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
                if (file) onFileSelect(file)
              }}
              aria-label="Upload pitch deck PDF"
            />
          </div>
        )
      )}
    </div>
  )
}
