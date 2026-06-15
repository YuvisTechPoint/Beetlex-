import { X } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SubmissionFormValues } from './schemas'

interface SubmissionFormFieldsProps {
  register: UseFormRegister<SubmissionFormValues>
  errors: FieldErrors<SubmissionFormValues>
  disabled?: boolean
  techStack: string[]
  description: string
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: (raw: string) => void
  onRemoveTag: (tag: string) => void
  onBlurSave: () => void
}

export function SubmissionFormFields({
  register,
  errors,
  disabled,
  techStack,
  description,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onBlurSave,
}: SubmissionFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          {...register('title')}
          disabled={disabled}
          onBlur={onBlurSave}
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
          onBlur={onBlurSave}
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
                  onClick={() => onRemoveTag(tag)}
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
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  onAddTag(tagInput)
                }
              }}
              onBlur={() => {
                onAddTag(tagInput)
                onBlurSave()
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
            onBlur={onBlurSave}
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
            onBlur={onBlurSave}
            placeholder="https://github.com/org/repo"
          />
          {errors.repoUrl && <p className="text-sm text-destructive">{errors.repoUrl.message}</p>}
        </div>
      </div>
    </>
  )
}
