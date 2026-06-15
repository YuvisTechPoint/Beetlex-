import { Link } from 'react-router-dom'
import { ExternalLink, Globe, Share2 } from 'lucide-react'
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
    { href: '/#prizes', label: 'Prizes & Tracks' },
    { href: '/#sponsors', label: 'Sponsors' },
    { href: '/legal/privacy', label: 'Privacy' },
    { href: '/legal/terms', label: 'Terms' },
  ],
  Legal: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/#faq', label: 'Code of Conduct' },
  ],
} as const

const SOCIAL_LINKS = [
  { href: 'https://twitter.com', label: 'Twitter', icon: Share2 },
  { href: 'https://github.com', label: 'GitHub', icon: ExternalLink },
  { href: 'https://discord.gg', label: 'Discord', icon: Globe },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Globe },
] as const

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" aria-label="BeetleX home">
              <BeetleLogo />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              BeetleX powers hackathons worldwide — from registration to judging, all in one platform built for builders.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BeetleX. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
