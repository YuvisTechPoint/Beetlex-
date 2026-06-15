import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  Gavel,
  Megaphone,
  Rocket,
  Trophy,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useBecomeOrganizer } from '@/hooks/useOrganizeHackathon'
import { ORGANIZER_FEATURES } from './constants'

const FEATURE_ICONS = [Users, Gavel, Trophy, Megaphone] as const

export function OrganizeHubContent() {
  const { user } = useAuth()
  const becomeOrganizer = useBecomeOrganizer()
  const isOrganizer = user?.role === 'organizer'

  const handleBecomeOrganizer = async () => {
    try {
      await becomeOrganizer.mutateAsync()
      toast.success('You are now an organizer')
    } catch {
      toast.error('Could not enable organizer access')
    }
  }

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Rocket className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <p className="text-label">Host on BeetleX</p>
        <h1 className="text-heading mt-2 text-balance">Organize your hackathon</h1>
        <p className="text-subtitle mx-auto mt-3 max-w-2xl">
          Launch a branded event, manage registrations and submissions, assign judges, and publish
          live standings — all from one hub.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link to="/organize/create">
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Create hackathon
            </Link>
          </Button>
          {isOrganizer ? (
            <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <Link to="/organizer">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Open Organizer Hub
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              disabled={becomeOrganizer.isPending}
              onClick={() => void handleBecomeOrganizer()}
            >
              Enable organizer tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {ORGANIZER_FEATURES.map((feature, index) => {
          const Icon = FEATURE_ICONS[index] ?? Users
          return (
            <Card key={feature.title} className="border-border/80">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <p className="font-semibold">Ready to go live?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your event in minutes. You can refine tracks, prizes, and sponsors later from
              the Organizer Hub.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/organize/create">Start creating</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
