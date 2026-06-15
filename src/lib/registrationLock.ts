const STALE_MS = 30_000

export function registrationLockKey(eventId: string) {
  return `registering_${eventId}`
}

export function setRegistrationLock(eventId: string) {
  localStorage.setItem(registrationLockKey(eventId), String(Date.now()))
}

export function clearRegistrationLock(eventId: string) {
  localStorage.removeItem(registrationLockKey(eventId))
}

export function isRegistrationInProgress(eventId: string): boolean {
  const raw = localStorage.getItem(registrationLockKey(eventId))
  if (!raw) return false

  const timestamp = Number(raw)
  if (Number.isNaN(timestamp) || Date.now() - timestamp > STALE_MS) {
    clearRegistrationLock(eventId)
    return false
  }

  return true
}
