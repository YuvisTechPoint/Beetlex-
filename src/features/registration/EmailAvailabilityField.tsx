import type { UseFormReturn } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useEmailAvailability } from '@/hooks/useEmailAvailability'
import type { RegistrationFormValues } from './schemas'

interface EmailAvailabilityFieldProps {
  form: UseFormReturn<RegistrationFormValues>
  eventId?: string
}

export function EmailAvailabilityField({ form, eventId }: EmailAvailabilityFieldProps) {
  const email = form.watch('email')
  const { isChecking, isAvailable, message } = useEmailAvailability(eventId, email)

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email *</FormLabel>
          <FormControl>
            <Input type="email" placeholder="you@university.edu" {...field} />
          </FormControl>
          {isChecking && (
            <FormDescription className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Checking email availability…
            </FormDescription>
          )}
          {!isChecking && isAvailable === false && message && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {message}
            </p>
          )}
          {!isChecking && isAvailable === true && email.includes('@') && (
            <FormDescription className="text-emerald-600 dark:text-emerald-400">
              Email is available for this event
            </FormDescription>
          )}
          <FormMessage role="alert" />
        </FormItem>
      )}
    />
  )
}
