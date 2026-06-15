import { useEffect, useRef } from 'react'
import { useNotificationSync } from '@/hooks/useNotificationSync'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { SignInDialog } from '@/components/layout/SignInDialog'
import { UrgentBanner } from '@/components/layout/UrgentBanner'
import { HeroBeamLine, useHeroBeamMetrics, useHeroNavBeam } from '@/components/ui/lamp'
import { HeaderActions } from './HeaderActions'
import { HeaderBrand } from './HeaderBrand'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

interface HeaderProps {
  overHero?: boolean
}

export function Header({ overHero = false }: HeaderProps) {
  const signInOpen = useUiStore((s) => s.signInOpen)
  const setSignInOpen = useUiStore((s) => s.setSignInOpen)
  const isDark = useUiStore((s) => s.darkMode)
  const headerRef = useRef<HTMLElement>(null)
  const navMeasureRef = useRef<HTMLDivElement>(null)
  const { width: beamWidth, offsetLeft: beamLeft } = useHeroBeamMetrics()

  useNotificationSync()
  useHeroNavBeam(navMeasureRef, headerRef, overHero && isDark)

  useEffect(() => {
    const node = headerRef.current
    if (!node) return

    const syncHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${node.offsetHeight}px`)
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(node)
    window.addEventListener('resize', syncHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeight)
      document.documentElement.style.removeProperty('--site-header-height')
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        'z-50 w-full backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md',
        overHero
          ? 'absolute inset-x-0 top-0 border-b-0 bg-background/70 dark:bg-background/45'
          : 'sticky top-0 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/90',
      )}
    >
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
      <UrgentBanner />

      <div className="relative">
        {overHero && isDark && beamWidth != null && beamLeft != null && (
          <div
            className="pointer-events-none absolute bottom-0"
            style={{ left: beamLeft, width: beamWidth }}
          >
            <HeroBeamLine animate={false} width={beamWidth} />
          </div>
        )}

        <div className="container mx-auto flex h-14 min-w-0 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <MobileNav />
            <HeaderBrand />
          </div>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center md:flex"
            aria-label="Main navigation"
          >
            <div ref={navMeasureRef} className="inline-flex items-center">
              <NavLinks />
            </div>
          </nav>

          <HeaderActions />
        </div>
      </div>
    </header>
  )
}
