import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageBackNav } from '@/components/layout/PageBackNav'
import { OrganizeHubContent } from '@/features/organize'

export default function OrganizeHubPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <PageBackNav to="/" label="Back to Home" title="Organize a Hackathon" />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <OrganizeHubContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
