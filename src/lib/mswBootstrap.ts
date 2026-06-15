let bootstrapPromise: Promise<void> | null = null

/** Starts MSW on first API call so the worker chunk is not on the critical path. */
export function ensureMswStarted(): Promise<void> {
  if (import.meta.env.VITE_DISABLE_MSW === 'true') {
    return Promise.resolve()
  }
  if (!bootstrapPromise) {
    bootstrapPromise = import('@/mocks/browser')
      .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }))
      .then(() => undefined)
  }
  return bootstrapPromise
}
