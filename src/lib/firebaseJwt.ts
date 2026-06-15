export interface FirebaseIdTokenClaims {
  sub: string
  email?: string
  name?: string
  picture?: string
  exp?: number
  firebase?: { sign_in_provider?: string }
}

export function isFirebaseIdToken(token: string): boolean {
  return token.startsWith('eyJ') && token.split('.').length === 3
}

export function decodeFirebaseIdToken(token: string): FirebaseIdTokenClaims | null {
  if (!isFirebaseIdToken(token)) return null

  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded)) as FirebaseIdTokenClaims

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
