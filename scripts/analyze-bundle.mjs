#!/usr/bin/env node
/**
 * Parses Vite dist assets and writes reports/bundle/stats.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist', 'assets')

function collectChunks(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => {
      const size = fs.statSync(path.join(dir, name)).size
      return { name, sizeKb: Math.round(size / 1024) }
    })
    .sort((a, b) => b.sizeKb - a.sizeKb)
}

function main() {
  const chunks = collectChunks(DIST)
  const totalKb = chunks.reduce((sum, chunk) => sum + chunk.sizeKb, 0)
  const outDir = path.join(ROOT, 'reports', 'bundle')
  fs.mkdirSync(outDir, { recursive: true })
  const payload = {
    generatedAt: new Date().toISOString(),
    totalKb,
    chunks,
  }
  fs.writeFileSync(path.join(outDir, 'stats.json'), JSON.stringify(payload, null, 2))
  console.log(`Bundle stats: ${totalKb} KB across ${chunks.length} JS chunks`)
}

main()
