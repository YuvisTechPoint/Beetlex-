import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { StepWizard } from '@/features/registration/StepWizard'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateOrganizerEvent } from '@/hooks/useOrganizeHackathon'
import { CREATE_HACKATHON_STEPS } from './constants'
import {
  basicsSchema,
  scheduleSchema,
  tracksSchema,
  defaultCreateHackathonValues,
  toCreateEventPayload,
  type CreateHackathonFormValues,
} from './schemas'

const STEP_SCHEMAS = [basicsSchema, scheduleSchema, tracksSchema]

export function CreateHackathonForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const createMutation = useCreateOrganizerEvent()

  const form = useForm<CreateHackathonFormValues>({
    defaultValues: defaultCreateHackathonValues(),
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tracks',
  })

  const validateStep = async () => {
    const schema = STEP_SCHEMAS[step]
    const values = form.getValues()
    const result = schema.safeParse(values)
    if (!result.success) {
      form.clearErrors()
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        form.setError(path as keyof CreateHackathonFormValues, { message: issue.message })
      }
      return false
    }
    return true
  }

  const handleNext = async () => {
    const valid = await validateStep()
    if (valid) setStep((current) => Math.min(current + 1, CREATE_HACKATHON_STEPS.length - 1))
  }

  const handleBack = () => setStep((current) => Math.max(current - 1, 0))

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const { event } = await createMutation.mutateAsync(toCreateEventPayload(values))
      toast.success('Hackathon created successfully', {
        description: 'Your event is live. Open Organizer Hub to manage registrations.',
      })
      navigate(`/events/${event.id}`)
    } catch {
      toast.error('Failed to create hackathon. Please try again.')
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <StepWizard
          steps={CREATE_HACKATHON_STEPS}
          currentStep={step}
          onBack={handleBack}
          onNext={() => void handleNext()}
          onSubmit={() => void handleSubmit()}
          isFirstStep={step === 0}
          isLastStep={step === CREATE_HACKATHON_STEPS.length - 1}
          isSubmitting={createMutation.isPending}
          nextDisabled={createMutation.isPending}
        >
          {step === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hackathon name</FormLabel>
                    <FormControl>
                      <Input placeholder="BeetleX AI Forge 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Build the next generation of intelligent apps" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Tell participants what your event is about…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rules (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Submission and eligibility rules" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eligibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Who can participate?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="registrationOpen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration opens</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationClose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration closes</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="submissionDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submission deadline</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="judgingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judging date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resultsDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Results announcement</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid max-w-md gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="teamMinSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min team size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={4}
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamMaxSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max team size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add competition tracks. Participants choose one when registering.
              </p>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Track {index + 1}</p>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        aria-label={`Remove track ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.name`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <FormLabel>Track name</FormLabel>
                        <FormControl>
                          <Input placeholder="Generative AI & LLMs" {...trackField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.description`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="What should teams build in this track?" {...trackField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              {fields.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', description: '' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add track
                </Button>
              )}
            </div>
          )}
        </StepWizard>
      </form>
    </Form>
  )
}
