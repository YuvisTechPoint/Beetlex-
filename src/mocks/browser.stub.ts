/** No-op MSW worker used when VITE_DISABLE_MSW=true (Lighthouse perf builds). */
export const worker = {
  start: async () => undefined,
}
