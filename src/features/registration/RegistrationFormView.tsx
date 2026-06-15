import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Event } from '@/types'
import { PersonalInfoStep } from './PersonalInfoStep'
import { RegistrationConfirmation } from './RegistrationConfirmation'
import { RegistrationPageShell } from './RegistrationPageShell'
import { ReviewStep } from './ReviewStep'
import { StepWizard } from './StepWizard'
import { TeamSetupStep } from './TeamSetupStep'
import { TrackSelectionStep } from './TrackSelectionStep'
import { usesTrackSelectionStep } from './teamMode'
import type { RegistrationPageState } from './useRegistrationPage'

type RegistrationFormViewProps = Pick<
  RegistrationPageState,
  | 'form'
  | 'currentStep'
  | 'setCurrentStep'
  | 'teamMode'
  | 'wizardSteps'
  | 'wizardStepIndex'
  | 'isSubmitting'
  | 'overloadPaused'
  | 'queueInfo'
  | 'isRetryingSubmit'
  | 'handleNext'
  | 'handleBack'
  | 'handleSubmit'
> & {
  event: Event
}

export function RegistrationConfirmationView({
  event,
  result,
}: {
  event: Event
  result: NonNullable<RegistrationPageState['result']>
}) {
  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto px-4 py-12">
        <RegistrationConfirmation event={event} result={result} />
      </main>
    </RegistrationPageShell>
  )
}

export function RegistrationFormView({
  event,
  form,
  currentStep,
  setCurrentStep,
  teamMode,
  wizardSteps,
  wizardStepIndex,
  isSubmitting,
  overloadPaused,
  queueInfo,
  isRetryingSubmit,
  handleNext,
  handleBack,
  handleSubmit,
}: RegistrationFormViewProps) {
  const navigate = useNavigate()

  return (
    <RegistrationPageShell>
      <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
            &larr; Back
          </Button>
          <p className="text-label">Registration</p>
          <h1 className="text-heading mt-2">Join {event.title}</h1>
          <p className="text-subtitle mt-2 max-w-lg">
            Takes about 4 minutes. You can save progress and return anytime before registration
            closes.
          </p>
        </div>

        {overloadPaused && (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Registration temporarily unavailable</AlertTitle>
            <AlertDescription>
              High demand right now. Your form is saved locally and we are retrying automatically
              every 30 seconds.
            </AlertDescription>
          </Alert>
        )}

        {queueInfo && (
          <Alert className="mb-4">
            <AlertTitle>Virtual queue</AlertTitle>
            <AlertDescription>
              Position {queueInfo.queuePosition ?? '—'} — estimated wait{' '}
              {Math.ceil((queueInfo.estimatedWaitSeconds ?? 120) / 60)} minutes.
            </AlertDescription>
          </Alert>
        )}

        {isRetryingSubmit && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Submitting registration</AlertTitle>
            <AlertDescription>
              High demand — retrying automatically if the server is busy.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <StepWizard
              steps={wizardSteps}
              currentStep={wizardStepIndex}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={() => void handleSubmit()}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === 3}
              isSubmitting={isSubmitting}
            >
              {currentStep === 0 && <PersonalInfoStep form={form} eventId={event.id} />}
              {currentStep === 1 && <TeamSetupStep form={form} event={event} />}
              {currentStep === 2 && usesTrackSelectionStep(teamMode) && (
                <TrackSelectionStep form={form} event={event} />
              )}
              {currentStep === 3 && (
                <ReviewStep form={form} event={event} onEditStep={setCurrentStep} />
              )}
            </StepWizard>
          </CardContent>
        </Card>
      </main>
    </RegistrationPageShell>
  )
}
