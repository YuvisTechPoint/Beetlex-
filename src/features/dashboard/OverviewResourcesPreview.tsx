import { useEventResources } from '@/hooks/useEventResources'
import { useMyTeam } from '@/hooks/useMyTeam'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ResourceCards } from './ResourceCards'

export function OverviewResourcesPreview() {
  const { data: team, isLoading: teamLoading } = useMyTeam()
  const { data: resources, isLoading: resourcesLoading } = useEventResources(team?.eventId)

  if (teamLoading || resourcesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <p className="text-sm text-muted-foreground">Quick links to help you build faster</p>
      </CardHeader>
      <CardContent>
        <ResourceCards resources={resources ?? []} compact />
      </CardContent>
    </Card>
  )
}
