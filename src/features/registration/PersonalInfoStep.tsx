import type { UseFormReturn } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EmailAvailabilityField } from './EmailAvailabilityField'
import type { RegistrationFormValues } from './schemas'

export interface PersonalInfoStepProps {
  form: UseFormReturn<RegistrationFormValues>
  eventId?: string
}

export function PersonalInfoStep({ form, eventId }: PersonalInfoStepProps) {
  const bioLength = form.watch('bio')?.length ?? 0

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself for event registration.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name *</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Chen" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <EmailAvailabilityField form={form} eventId={eventId} />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role in project *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="data_scientist">Data Scientist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College / University</FormLabel>
                <FormControl>
                  <Input placeholder="MIT" {...field} />
                </FormControl>
                <FormDescription>One of college or organization is required</FormDescription>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Company or lab" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/you" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="githubUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub username (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="octocat" {...field} />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief bio (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your background and interests..."
                  className="min-h-[100px] resize-none"
                  maxLength={300}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right">{bioLength}/300 characters</FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
