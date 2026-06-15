export const delayMs = {
  get: () => Math.floor(Math.random() * 300) + 300,
  mutate: () => Math.floor(Math.random() * 500) + 500,
  upload: 2000,
}

export async function randomGetDelay() {
  const { delay } = await import('msw')
  if (import.meta.env.VITE_QA_FAST_MS === 'true') {
    await delay(30)
    return
  }
  await delay(delayMs.get())
}

export async function randomMutateDelay() {
  const { delay } = await import('msw')
  if (import.meta.env.VITE_QA_FAST_MS === 'true') {
    await delay(50)
    return
  }
  await delay(delayMs.mutate())
}
