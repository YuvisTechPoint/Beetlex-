import { RegistrationAlreadyRegisteredView } from './RegistrationAlreadyRegisteredView'
import { RegistrationAuthRequiredView } from './RegistrationAuthRequiredView'
import { RegistrationClosedView } from './RegistrationClosedView'
import { RegistrationErrorView } from './RegistrationErrorView'
import {
  RegistrationConfirmationView,
  RegistrationFormView,
} from './RegistrationFormView'
import { RegistrationInProgressView } from './RegistrationInProgressView'
import { RegistrationLoadingView } from './RegistrationLoadingView'
import type { RegistrationPageState } from './useRegistrationPage'

export function RegistrationPageContent(state: RegistrationPageState) {
  const {
    event,
    isLoading,
    isError,
    registrationsLoading,
    isAuthenticated,
    form,
    currentStep,
    setCurrentStep,
    teamMode,
    wizardSteps,
    wizardStepIndex,
    isSubmitting,
    result,
    duplicateInfo,
    existingRegistration,
    registrationInProgressElsewhere,
    overloadPaused,
    queueInfo,
    isRetryingSubmit,
    registrationClosed,
    handleNext,
    handleBack,
    handleSubmit,
  } = state

  if (isLoading || registrationsLoading) {
    return <RegistrationLoadingView />
  }

  if (isError || !event) {
    return <RegistrationErrorView />
  }

  if (!isAuthenticated) {
    return <RegistrationAuthRequiredView event={event} />
  }

  if (result) {
    return <RegistrationConfirmationView event={event} result={result} />
  }

  if (existingRegistration || duplicateInfo) {
    return (
      <RegistrationAlreadyRegisteredView
        event={event}
        duplicateInfo={duplicateInfo}
        existingRegistration={existingRegistration}
      />
    )
  }

  if (registrationInProgressElsewhere) {
    return <RegistrationInProgressView event={event} />
  }

  if (registrationClosed) {
    return <RegistrationClosedView event={event} />
  }

  return (
    <RegistrationFormView
      event={event}
      form={form}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      teamMode={teamMode}
      wizardSteps={wizardSteps}
      wizardStepIndex={wizardStepIndex}
      isSubmitting={isSubmitting}
      overloadPaused={overloadPaused}
      queueInfo={queueInfo}
      isRetryingSubmit={isRetryingSubmit}
      handleNext={handleNext}
      handleBack={handleBack}
      handleSubmit={handleSubmit}
    />
  )
}
