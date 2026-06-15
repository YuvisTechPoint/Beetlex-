/** True when MSW should intercept API calls (default on — this repo has no real backend). */
export function isMswEnabled(): boolean {
  return import.meta.env.VITE_DISABLE_MSW !== 'true'
}

/** True when QA automation UI (dev toolbar) should be visible. */
export function isQaAutomationMode(): boolean {
  return isMswEnabled()
}
