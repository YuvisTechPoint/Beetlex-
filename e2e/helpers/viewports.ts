export interface ViewportProfile {
  width: number
  height: number
  bucket: 'mobile' | 'tablet' | 'desktop' | 'ultrawide'
  label: string
}

/** Assignment viewport matrix for responsive screenshot audits. */
export const VIEWPORT_MATRIX: ViewportProfile[] = [
  { width: 320, height: 568, bucket: 'mobile', label: 'mobile-xs' },
  { width: 375, height: 812, bucket: 'mobile', label: 'mobile-sm' },
  { width: 390, height: 844, bucket: 'mobile', label: 'mobile-md' },
  { width: 414, height: 896, bucket: 'mobile', label: 'mobile-lg' },
  { width: 768, height: 1024, bucket: 'tablet', label: 'tablet' },
  { width: 1024, height: 768, bucket: 'tablet', label: 'tablet-landscape' },
  { width: 1280, height: 800, bucket: 'desktop', label: 'laptop' },
  { width: 1440, height: 900, bucket: 'desktop', label: 'desktop' },
  { width: 1920, height: 1080, bucket: 'ultrawide', label: 'ultrawide' },
]

export function viewportFilename(
  routeSlug: string,
  profile: ViewportProfile,
): string {
  return `${routeSlug}--${profile.bucket}--${profile.width}x${profile.height}.png`
}
