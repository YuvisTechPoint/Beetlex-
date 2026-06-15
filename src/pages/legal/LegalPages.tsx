import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">{body}</p>
        <Button asChild className="mt-8" variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </main>
      <Footer />
    </>
  )
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      body="BeetleX respects your privacy. This placeholder policy describes how participant data (name, email, team info) is used solely for hackathon operations. Full legal text would be provided by the organizer before production launch."
    />
  )
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      body="By participating in BeetleX hackathons you agree to follow event rules, respect intellectual property, and comply with the code of conduct. This is a placeholder terms page for the frontend assignment."
    />
  )
}
