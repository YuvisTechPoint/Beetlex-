import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ContactSection() {
  return (
    <section id="contact" className="section-shell border-t bg-muted/30" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <div className="section-intro-left">
          <p className="text-label">Contact</p>
          <h2 id="contact-heading" className="text-heading mt-3">
            Get in touch
          </h2>
          <p className="text-subtitle mt-3 max-w-lg">
            Questions about registration, sponsorship, or judging — reach the team directly.
          </p>
        </div>

        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">General</CardTitle>
              <CardDescription>Hackathon support</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:hello@beetlex.dev"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                hello@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
              <CardDescription>Partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:sponsors@beetlex.dev"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                sponsors@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Community</CardTitle>
              <CardDescription>Discord</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://discord.gg/beetlex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Join server
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
