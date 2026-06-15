import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ContactSection() {
  return (
    <section id="contact" className="border-t bg-muted/20 py-20" aria-labelledby="contact-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="contact-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Get in touch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions about registration, sponsorship, or judging? Our team is here to help.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
              <CardDescription>Hackathon support</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:hello@beetlex.dev"
                className="text-sm font-medium text-primary hover:underline"
              >
                hello@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sponsors</CardTitle>
              <CardDescription>Partnership inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:sponsors@beetlex.dev"
                className="text-sm font-medium text-primary hover:underline"
              >
                sponsors@beetlex.dev
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discord</CardTitle>
              <CardDescription>Community & mentors</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://discord.gg/beetlex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
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
