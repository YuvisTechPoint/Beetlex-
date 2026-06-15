#!/usr/bin/env node
/**
 * Exports static JSON fixtures for Lighthouse perf builds (no MSW).
 * Uses Vite SSR to load TypeScript mock modules.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'static-api')

async function main() {
  const server = await createServer({
    configFile: path.join(ROOT, 'vite.config.ts'),
    root: ROOT,
    logLevel: 'error',
  })

  try {
    const { mockEvents } = await server.ssrLoadModule('/src/mocks/data/events.ts')
    const { mockLeaderboard } = await server.ssrLoadModule('/src/mocks/data/leaderboard.ts')

    fs.mkdirSync(path.join(OUT, 'events'), { recursive: true })
    fs.mkdirSync(path.join(OUT, 'leaderboard'), { recursive: true })

    const listPayload = {
      data: mockEvents,
      pagination: {
        page: 1,
        limit: mockEvents.length,
        total: mockEvents.length,
        totalPages: 1,
      },
    }

    const activeEvents = mockEvents.filter((event) => event.status === 'active')

    fs.writeFileSync(path.join(OUT, 'events-list.json'), JSON.stringify(listPayload))
    fs.writeFileSync(
      path.join(OUT, 'events-active.json'),
      JSON.stringify({
        data: activeEvents,
        pagination: { page: 1, limit: activeEvents.length, total: activeEvents.length, totalPages: 1 },
      }),
    )

    for (const event of mockEvents) {
      fs.writeFileSync(path.join(OUT, 'events', `${event.id}.json`), JSON.stringify(event))
    }

    fs.writeFileSync(
      path.join(OUT, 'leaderboard', 'evt-active-1.json'),
      JSON.stringify({ published: true, entries: mockLeaderboard }),
    )
    fs.writeFileSync(
      path.join(OUT, 'leaderboard', 'evt-active-1-status.json'),
      JSON.stringify({ published: true }),
    )

    console.log(`Static API fixtures written to ${path.relative(ROOT, OUT)}`)
  } finally {
    await server.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
