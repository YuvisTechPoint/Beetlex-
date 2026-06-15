import type { UseFormReturn } from 'react-hook-form'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { RegistrationFormValues } from './schemas'

export interface CreateTeamFieldsProps {
  form: UseFormReturn<RegistrationFormValues>
  previewCode: string | null
}

export function CreateTeamFields({ form, previewCode }: CreateTeamFieldsProps) {
  const copyCode = async () => {
    if (!previewCode) return
    await navigator.clipboard.writeText(previewCode)
    toast.success('Invite code copied')
  }

  return (
    <>
      <FormField
        control={form.control}
        name="teamName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team name *</FormLabel>
            <FormControl>
              <Input placeholder="Quantum Coders" maxLength={30} {...field} />
            </FormControl>
            <FormDescription>3–30 characters, letters and numbers only</FormDescription>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="teamDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team description (optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What is your team building?"
                className="resize-none"
                maxLength={200}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-right">
              {(field.value?.length ?? 0)}/200 characters
            </FormDescription>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />

      {previewCode && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Generated invite code</p>
            <p className="font-mono text-lg font-semibold">{previewCode}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyCode()}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      )}
    </>
  )
}
