export function loadSessionDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function saveSessionDraft<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Storage quota exceeded — local draft is best-effort
  }
}

export function clearSessionDraft(key: string) {
  sessionStorage.removeItem(key)
}
