import type { RegistrationFormValues } from './schemas'

export interface WizardStep {
  id: string
  label: string
  description?: string
}

export interface RegistrationResult {
  registrationId?: string
  registrationCode?: string
  inviteCode?: string
  teamName?: string
  trackName?: string
  mode: 'create' | 'join' | 'solo'
}

export interface RegistrationDraft {
  values: RegistrationFormValues
  currentStep: number
}
