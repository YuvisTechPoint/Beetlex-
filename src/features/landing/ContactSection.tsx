import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, Handshake, Mail, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactChannel {
  label: string
  description: string
  href: string
  display: string
  external?: boolean
  icon: LucideIcon
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    label: 'General',
    description: 'Hackathon support',
    href: 'mailto:hello@beetlex.dev',
    display: 'hello@beetlex.dev',
    icon: Mail,
  },
  {
    label: 'Sponsors',
    description: 'Partnerships',
    href: 'mailto:sponsors@beetlex.dev',
    display: 'sponsors@beetlex.dev',
    icon: Handshake,
  },
  {
    label: 'Community',
    description: 'Discord',
    href: 'https://discord.gg/beetlex',
    display: 'Join server',
    external: true,
    icon: MessageCircle,
  },
]

function ContactCard({ channel }: { channel: ContactChannel }) {
  const Icon = channel.icon

  return (
    <a
      href={channel.href}
      target={channel.external ? '_blank' : undefined}
      rel={channel.external ? 'noopener noreferrer' : undefined}
      className={cn(
        'group surface-panel-elevated flex h-full flex-col p-5 transition-colors duration-200',
        'hover:border-primary/35 hover:bg-surface-elevated/80',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-muted/50 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">{channel.label}</p>
        <p className="text-meta mt-0.5">{channel.description}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-primary group-hover:underline group-hover:underline-offset-4">
        {channel.display}
      </p>
    </a>
  )
}

export function ContactSection() {
  return (
    <section id="contact" className="section-shell border-t bg-muted/30" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-label">Contact</p>
            <h2 id="contact-heading" className="text-heading mt-3">
              Get in touch
            </h2>
            <p className="text-subtitle mt-3">
              Questions about registration, sponsorship, or judging — reach the team directly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => (
              <ContactCard key={channel.label} channel={channel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
