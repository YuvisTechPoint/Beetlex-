export interface RetryOptions {
  maxAttempts: number
  baseDelayMs: number
  jitterMs?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  { maxAttempts, baseDelayMs, jitterMs = 1000, shouldRetry }: RetryOptions,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === maxAttempts - 1
      if (isLastAttempt || (shouldRetry && !shouldRetry(error, attempt))) {
        break
      }
      const delay = baseDelayMs * 2 ** attempt + Math.random() * jitterMs
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
