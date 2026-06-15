export type SponsorLogoSize = 'platinum' | 'gold' | 'silver' | 'bronze'

export const LOGO_HEIGHT: Record<SponsorLogoSize, string> = {
  platinum: 'h-7 sm:h-8',
  gold: 'h-6 sm:h-7',
  silver: 'h-5 sm:h-6',
  bronze: 'h-4 sm:h-5',
}

export const CARD_HEIGHT: Record<SponsorLogoSize, string> = {
  platinum: 'h-20 sm:h-24',
  gold: 'h-[4.5rem] sm:h-20',
  silver: 'h-16 sm:h-[4.5rem]',
  bronze: 'h-14 sm:h-16',
}

export const CARD_PADDING: Record<SponsorLogoSize, string> = {
  platinum: 'px-6 py-4',
  gold: 'px-5 py-3.5',
  silver: 'px-4 py-3',
  bronze: 'px-4 py-2.5',
}

export const GRID_COLUMNS: Record<SponsorLogoSize, string> = {
  platinum: 'mx-auto max-w-xl grid-cols-2',
  gold: 'mx-auto max-w-4xl grid-cols-2 sm:grid-cols-3',
  silver: 'mx-auto max-w-5xl grid-cols-2 md:grid-cols-4',
  bronze: 'mx-auto max-w-5xl grid-cols-2 sm:grid-cols-4',
}
