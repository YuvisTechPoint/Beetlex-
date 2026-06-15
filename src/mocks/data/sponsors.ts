import type { Sponsor } from '@/types'
import { BEETLEX_SHOWCASE_SPONSORS } from '@/data/sponsors'

export function createBeetlexSponsors(idPrefix = 'sp'): Sponsor[] {
  return BEETLEX_SHOWCASE_SPONSORS.map((sponsor, index) => ({
    id: `${idPrefix}-${index + 1}`,
    name: sponsor.name,
    logoUrl: sponsor.logoUrl,
    logoSlug: sponsor.logoSlug,
    tier: sponsor.tier,
    website: sponsor.website,
    category: sponsor.category,
  }))
}

export function pickShowcaseSponsors(
  picks: Array<{ name: string; tier: Sponsor['tier'] }>,
  idPrefix: string,
): Sponsor[] {
  const byName = new Map(
    BEETLEX_SHOWCASE_SPONSORS.map((sponsor) => [sponsor.name.toLowerCase(), sponsor]),
  )

  return picks.map((pick, index) => {
    const sponsor = byName.get(pick.name.toLowerCase())
    if (!sponsor) {
      throw new Error(`Unknown showcase sponsor: ${pick.name}`)
    }
    return {
      id: `${idPrefix}-${index + 1}`,
      name: sponsor.name,
      logoUrl: sponsor.logoUrl,
      logoSlug: sponsor.logoSlug,
      tier: pick.tier,
      website: sponsor.website,
      category: sponsor.category,
    }
  })
}
