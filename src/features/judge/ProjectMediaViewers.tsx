import { FileText, Video } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Submission } from '@/types'
import { ProjectOverviewTab } from './ProjectOverviewTab'
import { getPdfViewerUrl, getVideoEmbedUrl } from './utils'

interface ProjectMediaViewersProps {
  submission: Submission
}

export function ProjectMediaViewers({ submission }: ProjectMediaViewersProps) {
  const videoEmbed = submission.videoUrl ? getVideoEmbedUrl(submission.videoUrl) : null

  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="pitch" className="flex-1" disabled={!submission.pitchDeckUrl}>
          Pitch Deck
        </TabsTrigger>
        <TabsTrigger value="video" className="flex-1" disabled={!submission.videoUrl}>
          Video
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <ProjectOverviewTab submission={submission} />
      </TabsContent>

      <TabsContent value="pitch" className="mt-4">
        {submission.pitchDeckUrl ? (
          <div className="overflow-hidden rounded-lg border">
            <iframe
              src={getPdfViewerUrl(submission.pitchDeckUrl)}
              title={`${submission.title} pitch deck`}
              className="h-[min(60vh,480px)] w-full"
            />
            <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <a
                href={submission.pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open pitch deck in new tab
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pitch deck provided.</p>
        )}
      </TabsContent>

      <TabsContent value="video" className="mt-4">
        {submission.videoUrl ? (
          videoEmbed ? (
            <div className="overflow-hidden rounded-lg border">
              <div className="aspect-video">
                <iframe
                  src={videoEmbed}
                  title={`${submission.title} demo video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border p-4">
              <Video className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <a
                href={submission.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open video in new tab
              </a>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">No demo video provided.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
