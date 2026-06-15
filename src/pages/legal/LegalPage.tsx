import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export default function LegalPage({ title, body }: { title: string; body: string }) {
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
