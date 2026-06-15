import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as si from 'simple-icons'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '../public/sponsors')

const iconMap = {
  nvidia: 'siNvidia',
  huggingface: 'siHuggingface',
  cloudflare: 'siCloudflare',
  vercel: 'siVercel',
  github: 'siGithub',
  supabase: 'siSupabase',
  polygon: 'siPolygon',
  netlify: 'siNetlify',
  wandb: 'siWeightsandbiases',
  langchain: 'siLangchain',
}

function writeSvg(file, title, pathD, viewBox = '0 0 24 24') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-hidden="true"><title>${title}</title><path fill="currentColor" d="${pathD}"/></svg>`
  fs.writeFileSync(path.join(dir, file), svg, 'utf8')
}

for (const [file, key] of Object.entries(iconMap)) {
  const icon = si[key]
  writeSvg(`${file}.svg`, icon.title, icon.path)
}

const openaiPath = path.join(dir, 'openai.svg')
const openaiRaw = fs.readFileSync(openaiPath, 'utf8')
const openaiMatch = openaiRaw.match(/d="([^"]+)"/)
if (openaiMatch) {
  writeSvg('openai.svg', 'OpenAI', openaiMatch[1])
}

// Groq wordmark — simplified from official brand geometry (monochrome)
writeSvg(
  'groq.svg',
  'Groq',
  'M3.2 17.4V6.6h4.1c2.2 0 3.6 1.2 3.6 3.1 0 1.3-.7 2.2-1.8 2.6l2.4 5.1h-2.5l-2.1-4.6H5.4v4.6H3.2zm2.2-6.4h1.8c1.1 0 1.7-.5 1.7-1.3s-.6-1.3-1.7-1.3H5.4v2.6zm8.5 6.4 3.5-10.8h2.3l3.5 10.8h-2.3l-.7-2.2h-3.5l-.7 2.2h-2.1zm2.8-3.8h2.4l-1.2-3.7-1.2 3.7z',
  '0 0 24 24',
)

// Pinecone mark — scale cluster inspired by official pinecone icon
writeSvg(
  'pinecone.svg',
  'Pinecone',
  'M12 2.2c.6 0 1.1.5 1.1 1.1v1.4c2.1.5 3.6 2.4 3.6 4.6 0 .8-.2 1.6-.6 2.3l2.1 2.1c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-1.9-1.9c-.9.8-2.1 1.3-3.4 1.3-1.3 0-2.5-.5-3.4-1.3l-1.9 1.9c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l2.1-2.1c-.4-.7-.6-1.5-.6-2.3 0-2.2 1.5-4.1 3.6-4.6V3.3c0-.6.5-1.1 1.1-1.1zm-2.4 6.1c0 1.3 1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4-2.4 1.1-2.4 2.4zm0 4.8c0 1.3 1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4-1.1-2.4-2.4-2.4-2.4 1.1-2.4 2.4z',
  '0 0 24 24',
)

console.log('Sponsor SVGs normalized in', dir)
