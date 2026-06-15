/** True when MSW should intercept API calls (dev server or QA preview build). */
export function isMswEnabled(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_ENABLE_MSW === 'true'
  )
}

/** True when QA automation UI (dev toolbar) should be visible. */
export function isQaAutomationMode(): boolean {
  return isMswEnabled()
}
