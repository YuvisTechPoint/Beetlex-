import { ExternalLink } from 'lucide-react'
import type { EventResource } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getResourceIcon } from './resourceIcons'

interface ResourceCardsProps {
  resources: EventResource[]
  compact?: boolean
}

export function ResourceCards({ resources, compact }: ResourceCardsProps) {
  if (compact) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => {
          const Icon = getResourceIcon(resource.icon)
          return (
            <a
              key={resource.id}
              href={resource.href}
              target={resource.href.startsWith('#') ? undefined : '_blank'}
              rel={resource.href.startsWith('#') ? undefined : 'noopener noreferrer'}
              className="flex gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">{resource.title}</p>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resources.map((resource) => {
        const Icon = getResourceIcon(resource.icon)
        return (
          <Card key={resource.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 text-sm leading-relaxed">
                {resource.description}
              </CardDescription>
              <a
                href={resource.href}
                target={resource.href.startsWith('#') ? undefined : '_blank'}
                rel={resource.href.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open resource
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
