import type { Sponsor, SponsorCategory } from '@/types'

export type SponsorTier = Sponsor['tier']

export interface ShowcaseSponsor {
  id: string
  name: string
  tier: SponsorTier
  logoSlug: string
  logoUrl: string
  website: string
  category: SponsorCategory
}

export const SPONSOR_LOGO_BASE = '/sponsors'

export function sponsorLogoUrl(slug: string) {
  return `${SPONSOR_LOGO_BASE}/${slug}.svg`
}

export const BEETLEX_SHOWCASE_SPONSORS: ShowcaseSponsor[] = [
  {
    id: 'sp-openai',
    name: 'OpenAI',
    tier: 'platinum',
    logoSlug: 'openai',
    logoUrl: sponsorLogoUrl('openai'),
    website: 'https://openai.com',
    category: 'AI',
  },
  {
    id: 'sp-nvidia',
    name: 'NVIDIA',
    tier: 'platinum',
    logoSlug: 'nvidia',
    logoUrl: sponsorLogoUrl('nvidia'),
    website: 'https://www.nvidia.com',
    category: 'AI',
  },
  {
    id: 'sp-huggingface',
    name: 'Hugging Face',
    tier: 'gold',
    logoSlug: 'huggingface',
    logoUrl: sponsorLogoUrl('huggingface'),
    website: 'https://huggingface.co',
    category: 'Machine Learning',
  },
  {
    id: 'sp-cloudflare',
    name: 'Cloudflare',
    tier: 'gold',
    logoSlug: 'cloudflare',
    logoUrl: sponsorLogoUrl('cloudflare'),
    website: 'https://www.cloudflare.com',
    category: 'Cloud Infrastructure',
  },
  {
    id: 'sp-vercel',
    name: 'Vercel',
    tier: 'gold',
    logoSlug: 'vercel',
    logoUrl: sponsorLogoUrl('vercel'),
    website: 'https://vercel.com',
    category: 'Developer Tooling',
  },
  {
    id: 'sp-github',
    name: 'GitHub',
    tier: 'silver',
    logoSlug: 'github',
    logoUrl: sponsorLogoUrl('github'),
    website: 'https://github.com',
    category: 'Developer Tooling',
  },
  {
    id: 'sp-supabase',
    name: 'Supabase',
    tier: 'silver',
    logoSlug: 'supabase',
    logoUrl: sponsorLogoUrl('supabase'),
    website: 'https://supabase.com',
    category: 'Cloud Infrastructure',
  },
  {
    id: 'sp-polygon',
    name: 'Polygon',
    tier: 'silver',
    logoSlug: 'polygon',
    logoUrl: sponsorLogoUrl('polygon'),
    website: 'https://polygon.technology',
    category: 'Web3',
  },
  {
    id: 'sp-netlify',
    name: 'Netlify',
    tier: 'silver',
    logoSlug: 'netlify',
    logoUrl: sponsorLogoUrl('netlify'),
    website: 'https://www.netlify.com',
    category: 'Developer Tooling',
  },
  {
    id: 'sp-wandb',
    name: 'Weights & Biases',
    tier: 'bronze',
    logoSlug: 'wandb',
    logoUrl: sponsorLogoUrl('wandb'),
    website: 'https://wandb.ai',
    category: 'Machine Learning',
  },
  {
    id: 'sp-langchain',
    name: 'LangChain',
    tier: 'bronze',
    logoSlug: 'langchain',
    logoUrl: sponsorLogoUrl('langchain'),
    website: 'https://www.langchain.com',
    category: 'AI',
  },
  {
    id: 'sp-groq',
    name: 'Groq',
    tier: 'bronze',
    logoSlug: 'groq',
    logoUrl: sponsorLogoUrl('groq'),
    website: 'https://groq.com',
    category: 'AI',
  },
  {
    id: 'sp-pinecone',
    name: 'Pinecone',
    tier: 'bronze',
    logoSlug: 'pinecone',
    logoUrl: sponsorLogoUrl('pinecone'),
    website: 'https://www.pinecone.io',
    category: 'Machine Learning',
  },
]

export const SPONSOR_TIER_ORDER: SponsorTier[] = ['platinum', 'gold', 'silver', 'bronze']

export const SPONSOR_TIER_META: Record<SponsorTier, { label: string; description: string }> = {
  platinum: {
    label: 'Platinum',
    description: 'Founding partners powering the hackathon ecosystem',
  },
  gold: {
    label: 'Gold',
    description: 'Strategic partners accelerating builder velocity',
  },
  silver: {
    label: 'Silver',
    description: 'Platform partners supporting teams at scale',
  },
  bronze: {
    label: 'Bronze',
    description: 'Community partners backing the next wave of builders',
  },
}

export function groupSponsorsByTier<T extends { tier: SponsorTier }>(sponsors: T[]) {
  return SPONSOR_TIER_ORDER.map((tier) => ({
    tier,
    meta: SPONSOR_TIER_META[tier],
    sponsors: sponsors.filter((s) => s.tier === tier),
  })).filter((group) => group.sponsors.length > 0)
}

export function resolveShowcaseSponsors(eventSponsors?: Sponsor[]): ShowcaseSponsor[] {
  if (!eventSponsors?.length) return BEETLEX_SHOWCASE_SPONSORS

  const byName = new Map(
    BEETLEX_SHOWCASE_SPONSORS.map((sponsor) => [sponsor.name.toLowerCase(), sponsor]),
  )

  return eventSponsors.map((sponsor) => {
    const canonical = byName.get(sponsor.name.toLowerCase())
    const logoSlug =
      sponsor.logoSlug ??
      canonical?.logoSlug ??
      sponsor.logoUrl.split('/').pop()?.replace('.svg', '') ??
      sponsor.id

    return {
      id: sponsor.id,
      name: sponsor.name,
      tier: sponsor.tier,
      logoSlug,
      logoUrl: sponsor.logoUrl.startsWith('/sponsors/')
        ? sponsor.logoUrl
        : sponsorLogoUrl(logoSlug),
      website: sponsor.website,
      category: sponsor.category ?? canonical?.category ?? 'Developer Tooling',
    }
  })
}
