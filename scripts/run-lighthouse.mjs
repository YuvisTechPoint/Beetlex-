#!/usr/bin/env node
/**
 * Runs Lighthouse programmatically via Playwright's Chromium (avoids chrome-launcher temp cleanup issues on Windows).
 * Requires preview at QA_BASE_URL (default http://127.0.0.1:4173).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'reports', 'lighthouse')
const BASE_URL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173'
const DEBUG_PORT = 9222

const ROUTES = [
  { slug: 'landing', path: '/' },
  { slug: 'events', path: '/events' },
  { slug: 'event-detail', path: '/events/evt-upcoming-1' },
  { slug: 'registration', path: '/events/evt-upcoming-1/register' },
]

const FORM_FACTORS = ['desktop', 'mobile']

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scorePercent(category) {
  if (!category?.score && category?.score !== 0) return null
  return Math.round(category.score * 100)
}

async function auditRoute(url, outputBase, formFactor) {
  const jsonPath = path.join(OUT_DIR, `${outputBase}.report.json`)
  const htmlPath = path.join(OUT_DIR, `${outputBase}.report.html`)

  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${DEBUG_PORT}`, '--no-sandbox', '--disable-gpu'],
  })

  try {
    const options = {
      logLevel: 'error',
      output: 'json',
      port: DEBUG_PORT,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor,
      screenEmulation:
        formFactor === 'mobile'
          ? { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false }
          : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    }

    const runnerResult = await lighthouse(url, options)
    if (!runnerResult?.lhr) {
      throw new Error(`Lighthouse returned no report for ${url}`)
    }

    const { lhr } = runnerResult
    fs.writeFileSync(jsonPath, JSON.stringify(lhr, null, 2), 'utf8')

    const htmlRunner = await lighthouse(url, {
      ...options,
      output: 'html',
    })
    if (htmlRunner?.report) {
      const html =
        typeof htmlRunner.report === 'string'
          ? htmlRunner.report
          : Array.isArray(htmlRunner.report)
            ? htmlRunner.report[0]
            : null
      if (html) fs.writeFileSync(htmlPath, html, 'utf8')
    }
    return {
      scores: {
        performance: scorePercent(lhr.categories.performance),
        accessibility: scorePercent(lhr.categories.accessibility),
        bestPractices: scorePercent(lhr.categories['best-practices']),
        seo: scorePercent(lhr.categories.seo),
      },
      metrics: {
        fcp: lhr.audits['first-contentful-paint']?.displayValue ?? null,
        lcp: lhr.audits['largest-contentful-paint']?.displayValue ?? null,
        cls: lhr.audits['cumulative-layout-shift']?.displayValue ?? null,
        tbt: lhr.audits['total-blocking-time']?.displayValue ?? null,
      },
      artifacts: {
        json: path.relative(ROOT, jsonPath),
        html: fs.existsSync(htmlPath) ? path.relative(ROOT, htmlPath) : null,
      },
    }
  } finally {
    await browser.close()
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const results = []
  for (const route of ROUTES) {
    for (const formFactor of FORM_FACTORS) {
      const url = `${BASE_URL}${route.path}`
      const outputBase = `${route.slug}--${formFactor}`
      console.log(`Lighthouse: ${route.slug} (${formFactor})`)
      const audit = await auditRoute(url, outputBase, formFactor)
      results.push({
        route: route.slug,
        path: route.path,
        formFactor,
        url,
        ...audit,
      })
      console.log(
        `  perf=${audit.scores.performance} a11y=${audit.scores.accessibility} bp=${audit.scores.bestPractices} seo=${audit.scores.seo}`,
      )
      await sleep(1000)
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    engine: 'playwright-chromium + lighthouse',
    results,
    averages: {
      performance: Math.round(
        results.reduce((sum, r) => sum + (r.scores.performance ?? 0), 0) / results.length,
      ),
      accessibility: Math.round(
        results.reduce((sum, r) => sum + (r.scores.accessibility ?? 0), 0) / results.length,
      ),
      bestPractices: Math.round(
        results.reduce((sum, r) => sum + (r.scores.bestPractices ?? 0), 0) / results.length,
      ),
      seo: Math.round(
        results.reduce((sum, r) => sum + (r.scores.seo ?? 0), 0) / results.length,
      ),
    },
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2),
    'utf8',
  )

  console.log('\nLighthouse summary written to reports/lighthouse/summary.json')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
