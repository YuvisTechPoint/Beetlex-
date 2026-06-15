/** No-op MSW bootstrap for perf builds (VITE_DISABLE_MSW=true). */
export function ensureMswStarted(): Promise<void> {
  return Promise.resolve()
}
