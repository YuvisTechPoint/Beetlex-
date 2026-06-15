import { useEvent } from '@/hooks/useEvent'
import { useEventResources } from '@/hooks/useEventResources'
import { useMyTeam } from '@/hooks/useMyTeam'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ResourceCards } from './ResourceCards'

export function ResourcesTab() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const { data: event, isLoading: eventLoading } = useEvent(team?.eventId)
  const { data: resources, isLoading: resourcesLoading } = useEventResources(team?.eventId)

  if (teamLoading || eventLoading || resourcesLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
        <p className="text-muted-foreground">
          Everything you need to build and submit for {event?.title ?? 'your hackathon'}.
        </p>
      </div>

      <ResourceCards resources={resources ?? []} />

      {event && (
        <Card>
          <CardHeader>
            <CardTitle>Track Problem Statements</CardTitle>
            <CardDescription>Your event has {event.tracks.length} tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.tracks.map((track) => (
              <div key={track.id} id="problem-statements" className="rounded-lg border p-4">
                <h3 className="font-semibold">{track.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{track.problemStatement}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {track.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
