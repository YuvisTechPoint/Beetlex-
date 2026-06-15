import { ApiClientError } from '@/api/client'
import type { RegistrationTeamMode } from './teamMode'

export const MIN_SUBMIT_INTERVAL_MS = 5_000
export const IDEMPOTENCY_KEY_PREFIX = 'registration-idempotency-'

export function generateInvitePreview(teamName: string): string {
  return teamName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, 'X')
}

export const REGISTRATION_STEPS = [
  { id: 'personal', label: 'Personal Info', description: 'Your details' },
  { id: 'team', label: 'Team Setup', description: 'Solo, create, or join' },
  { id: 'track', label: 'Track', description: 'Choose a track' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
] as const

export function getRegistrationSteps(teamMode: RegistrationTeamMode) {
  if (teamMode === 'join') {
    return REGISTRATION_STEPS.filter((step) => step.id !== 'track')
  }
  return REGISTRATION_STEPS
}

export function getRegistrationStepIndex(
  currentStep: number,
  teamMode: RegistrationTeamMode,
): number {
  if (teamMode === 'join') {
    if (currentStep <= 1) return currentStep
    return 2
  }
  return currentStep
}

export function isRetryableRegistrationError(error: unknown) {
  if (!(error instanceof ApiClientError)) return false
  return (
    error.code === 'HTTP_429' ||
    error.code === 'HTTP_503' ||
    error.code === 'RATE_LIMITED' ||
    error.code === 'SERVICE_UNAVAILABLE'
  )
}
