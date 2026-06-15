import { Loader2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { SCORE_CRITERIA, type ScoringFormValues } from './schemas'

interface ScoringFormProps {
  form: UseFormReturn<ScoringFormValues>
  onSubmit: () => void
  isSubmitting: boolean
  isAlreadyScored: boolean
}

export function ScoringForm({ form, onSubmit, isSubmitting, isAlreadyScored }: ScoringFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
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

        <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isAlreadyScored ? 'Update score' : 'Submit score'}
        </Button>
      </form>
    </Form>
  )
}
