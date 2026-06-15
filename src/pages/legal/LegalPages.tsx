import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePageMeta } from '@/hooks/usePageMeta'

interface LegalSection {
  heading: string
  paragraphs: string[]
}

function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}) {
  usePageMeta({
    title,
    description: `${title} for BeetleX hackathon participants, organizers, and judges.`,
  })

  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-sm text-muted-foreground">Last updated {lastUpdated}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
              <Separator className="my-3" />
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Button asChild className="mt-10" variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </main>
      <Footer />
    </>
  )
}

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="June 15, 2026"
      intro="BeetleX processes participant data solely to operate hackathon events. This policy describes what we collect, why we collect it, and how you can manage your information."
      sections={[
        {
          heading: 'Information we collect',
          paragraphs: [
            'Account details such as name, email address, college or organization, and team membership.',
            'Event participation data including registration choices, submissions, scores, and in-app notifications.',
            'Technical logs such as browser type and session timestamps for security and reliability.',
          ],
        },
        {
          heading: 'How we use data',
          paragraphs: [
            'To register teams, deliver announcements, display leaderboards, and coordinate judging workflows.',
            'To prevent duplicate registrations, enforce submission deadlines, and maintain audit trails for organizers.',
            'We do not sell personal data. Aggregated, anonymized metrics may be shared with event sponsors.',
          ],
        },
        {
          heading: 'Your choices',
          paragraphs: [
            'You may request correction or deletion of your profile by contacting the event organizer at privacy@beetlex.io.',
            'Notification preferences and read-state are stored locally and synced to your account session.',
          ],
        },
      ]}
    />
  )
}

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="June 15, 2026"
      intro="By accessing BeetleX you agree to these terms. If you do not agree, do not register or submit projects for any event hosted on the platform."
      sections={[
        {
          heading: 'Eligibility & conduct',
          paragraphs: [
            'Participants must meet event-specific eligibility requirements published on each hackathon page.',
            'Harassment, plagiarism, and submission of pre-built work outside the allowed window are grounds for disqualification.',
          ],
        },
        {
          heading: 'Intellectual property',
          paragraphs: [
            'Teams retain ownership of their submissions unless otherwise stated in event rules.',
            'By submitting, you grant organizers a license to review, display, and judge your project during the event.',
          ],
        },
        {
          heading: 'Platform availability',
          paragraphs: [
            'BeetleX is provided as-is during beta events. Scheduled maintenance and live leaderboard updates may occur without notice.',
            'Organizers may modify timelines, tracks, or prizes with reasonable notice via in-app announcements.',
          ],
        },
      ]}
    />
  )
}
