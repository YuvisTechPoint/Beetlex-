export type SseSendFn = (id: string, event: string, data: unknown) => void

export function formatSseMessage(id: string, event: string, data: unknown): string {
  return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function createSseResponse(
  onStart: (send: SseSendFn, close: () => void) => void | (() => void),
): Response {
  const encoder = new TextEncoder()
  let cleanup: (() => void) | undefined

  const stream = new ReadableStream({
    start(controller) {
      const send: SseSendFn = (id, event, data) => {
        controller.enqueue(encoder.encode(formatSseMessage(id, event, data)))
      }
      const close = () => {
        cleanup?.()
        controller.close()
      }
      const result = onStart(send, close)
      if (typeof result === 'function') {
        cleanup = result
      }
    },
    cancel() {
      cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
