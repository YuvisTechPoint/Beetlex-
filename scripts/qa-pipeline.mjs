#!/usr/bin/env node
/**
 * Full QA pipeline: build → lint → bundle stats → screenshots → lighthouse → reports.
 */
import { spawn } from 'node:child_process'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import waitOn from 'wait-on'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function run(command, env = {}) {
  execSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: true,
  })
}

function ensureDirs() {
  for (const dir of [
    'reports/screenshots',
    'reports/lighthouse',
    'reports/playwright',
    'reports/bundle',
  ]) {
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true })
  }
}

function stopPreview(preview) {
  if (!preview || preview.killed) return
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${preview.pid} /T /F`, { stdio: 'ignore', shell: true })
    } else {
      preview.kill('SIGTERM')
    }
  } catch {
    // Preview process may already be stopped
  }
}

async function startPreview(script = 'preview:qa') {
  const child = spawn('npm', ['run', script], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true,
    env: process.env,
  })

  child.stdout?.on('data', (chunk) => process.stdout.write(chunk))
  child.stderr?.on('data', (chunk) => process.stderr.write(chunk))

  await waitOn({
    resources: ['http-get://127.0.0.1:4173'],
    timeout: 90_000,
    interval: 500,
    validateStatus: (status) => status >= 200 && status < 500,
  })

  return child
}

async function main() {
  ensureDirs()
  let preview = null
  const startedAt = new Date().toISOString()

  fs.writeFileSync(
    path.join(ROOT, 'reports', 'qa-run-meta.json'),
    JSON.stringify({ startedAt, status: 'running' }, null, 2),
  )

  try {
    console.log('\n=== [1/8] QA build (MSW + fast mocks) ===')
    run('npm run build:qa')

    console.log('\n=== [2/8] Bundle stats ===')
    run('node scripts/analyze-bundle.mjs')

    console.log('\n=== [3/8] ESLint ===')
    run('npm run lint')

    console.log('\n=== [4/8] Preview server ===')
    preview = await startPreview()

    console.log('\n=== [5/8] Playwright responsive screenshots ===')
    run('npx playwright test', { QA_SKIP_WEB_SERVER: '1', CI: '1' })

    console.log('\n=== [6/8] Perf build for Lighthouse (no MSW) ===')
    stopPreview(preview)
    preview = null
    run('npm run build:perf')
    preview = await startPreview('preview:qa')

    console.log('\n=== [7/8] Lighthouse audits (static API, no MSW bundle) ===')
    run('node scripts/run-lighthouse.mjs', { QA_BASE_URL: 'http://127.0.0.1:4173' })

    console.log('\n=== [8/8] Generating reports ===')
    run('node scripts/generate-quality-report.mjs')
    run('node scripts/generate-production-reports.mjs')
    run('node scripts/generate-audit-reports.mjs')

    fs.writeFileSync(
      path.join(ROOT, 'reports', 'qa-run-meta.json'),
      JSON.stringify(
        { startedAt, completedAt: new Date().toISOString(), status: 'passed' },
        null,
        2,
      ),
    )

    console.log('\n✓ QA pipeline complete.')
    console.log('  reports/QUALITY_AUDIT_REPORT.md')
    console.log('  FINAL_AUDIT_REPORT.md + 5 production reports at repo root')
  } catch (error) {
    fs.writeFileSync(
      path.join(ROOT, 'reports', 'qa-run-meta.json'),
      JSON.stringify(
        {
          startedAt,
          failedAt: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      ),
    )
    console.error('\n✗ QA pipeline failed:', error)
    process.exitCode = 1
  } finally {
    stopPreview(preview)
  }
}

main()
