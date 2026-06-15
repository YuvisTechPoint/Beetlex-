import { useNotificationSync } from '@/hooks/useNotificationSync'
import { useUiStore } from '@/store/uiStore'
import { SignInDialog } from '@/components/layout/SignInDialog'
import { UrgentBanner } from '@/components/layout/UrgentBanner'
import { HeaderActions } from './HeaderActions'
import { HeaderBrand } from './HeaderBrand'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

export function Header() {
  const signInOpen = useUiStore((s) => s.signInOpen)
  const setSignInOpen = useUiStore((s) => s.setSignInOpen)

  useNotificationSync()

  return (
    <div className="sticky top-0 z-50">
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
      <UrgentBanner />
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <div className="flex shrink-0 items-center gap-2">
            <MobileNav />
            <HeaderBrand />
          </div>

          <nav className="hidden flex-1 justify-center md:flex" aria-label="Main navigation">
            <NavLinks />
          </nav>

          <HeaderActions />
        </div>
      </header>
    </div>
  )
}
