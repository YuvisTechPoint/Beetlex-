import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateHackathonForm } from '@/features/organize'

export default function CreateHackathonPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <PageBackNav to="/organize" label="Back to Organize" title="Create Hackathon" />
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
          <Card>
            <CardHeader>
              <CardTitle>Set up your event</CardTitle>
              <CardDescription>
                Complete the steps below to publish your hackathon on BeetleX. You will be upgraded
                to organizer access automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateHackathonForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
