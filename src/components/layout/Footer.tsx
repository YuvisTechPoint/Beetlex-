import { Link } from 'react-router-dom'
import { BeetleLogo } from '@/components/layout/BeetleLogo'
import { Separator } from '@/components/ui/separator'

const FOOTER_LINKS = {
  Platform: [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/#about', label: 'About' },
    { href: '/#contact', label: 'Contact' },
  ],
  Resources: [
    { href: '/#faq', label: 'FAQ' },
    { href: '/#prizes', label: 'Tracks & prizes' },
    { href: '/#sponsors', label: 'Sponsors' },
  ],
  Legal: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/terms', label: 'Code of Conduct' },
  ],
} as const

export function Footer() {
  return (
    <footer className="border-t bg-muted/20" role="contentinfo">
      <div className="container mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="md:col-span-2 lg:col-span-5">
            <Link to="/" aria-label="BeetleX home">
              <BeetleLogo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              BeetleX is the operating system for high-stakes hackathons — from first registration
              to final standings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-label mb-4">{title}</h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-2 text-meta sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} BeetleX, Inc.</p>
          <p>Built for organizers who care about the details.</p>
        </div>
      </div>
    </footer>
  )
}
