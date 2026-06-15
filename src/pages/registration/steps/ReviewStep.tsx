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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  PROJECT_ROLE_LABELS,
  type RegistrationFormValues,
} from '@/pages/registration/schemas'
import type { Event } from '@/types'

interface ReviewStepProps {
  form: UseFormReturn<RegistrationFormValues>
  event: Event
  onEditStep: (step: number) => void
}

export function ReviewStep({ form, event, onEditStep }: ReviewStepProps) {
  const values = form.getValues()
  const selectedTrack = event.tracks.find((t) => t.id === values.trackId)

  const sections = [
    {
      title: 'Personal Info',
      step: 0,
      rows: [
        { label: 'Name', value: values.name },
        { label: 'Email', value: values.email },
        { label: 'Phone', value: values.phone || '—' },
        {
          label: 'Affiliation',
          value: [values.college, values.organization].filter(Boolean).join(' · ') || '—',
        },
        { label: 'Role', value: PROJECT_ROLE_LABELS[values.projectRole] },
        { label: 'LinkedIn', value: values.linkedinUrl || '—' },
        { label: 'GitHub', value: values.githubUsername || '—' },
        { label: 'Bio', value: values.bio || '—' },
      ],
    },
    {
      title: 'Team',
      step: 1,
      rows: [
        {
          label: 'Mode',
          value: values.teamMode === 'create' ? 'Create new team' : 'Join existing team',
        },
        {
          label: 'Team',
          value:
            values.teamMode === 'create'
              ? `"${values.teamName}"`
              : `${values.verifiedTeamName} (code: ${values.inviteCode?.toUpperCase()})`,
        },
        ...(values.teamDescription
          ? [{ label: 'Description', value: values.teamDescription }]
          : []),
      ],
    },
    {
      title: 'Track',
      step: 2,
      rows: [
        {
          label: 'Track',
          value:
            values.teamMode === 'join'
              ? 'Assigned by team'
              : (selectedTrack?.name ?? 'Not selected'),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review &amp; Submit</h2>
        <p className="text-sm text-muted-foreground">
          Double-check your registration details before submitting.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <Button type="button" variant="link" className="h-auto p-0" onClick={() => onEditStep(section.step)}>
              Edit
            </Button>
          </div>
          <dl className="rounded-lg border divide-y">
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 p-3 sm:flex-row sm:justify-between"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-medium sm:text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <dl className="rounded-lg border p-3">
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">Event</dt>
          <dd className="font-medium">{event.title}</dd>
        </div>
      </dl>

      <Separator />

      <Form {...form}>
        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Terms &amp; conditions *</FormLabel>
                <FormDescription>
                  I agree to the hackathon rules, code of conduct, and eligibility requirements.
                </FormDescription>
                <FormMessage role="alert" />
              </div>
            </FormItem>
          )}
        />
      </Form>
    </div>
  )
}
