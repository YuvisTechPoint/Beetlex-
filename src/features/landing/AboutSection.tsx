import { Code2, Globe, Trophy } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Code2,
    title: 'Build Real Projects',
    description:
      'Ship production-ready prototypes with mentorship from industry engineers and access to cloud credits.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connect with builders worldwide across AI, Web3, DevTools, and more — all on one platform.',
  },
  {
    icon: Trophy,
    title: 'Win Big',
    description:
      'Compete for cash prizes, internship interviews, cloud credits, and fast-track opportunities.',
  },
] as const

export function AboutSection() {
  return (
    <section id="about" className="py-20" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="about-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Why <span className="text-primary">BeetleX</span>?
          </h2>
          <p className="mt-4 text-muted-foreground">
            BeetleX is the end-to-end hackathon platform for organizers and participants. From registration
            and team formation to submissions and live judging — we handle the logistics so you can focus on building.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
