import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Event } from '@/types'

interface EventAboutTabsProps {
  event: Event
}

export function EventAboutTabs({ event }: EventAboutTabsProps) {
  return (
    <Tabs defaultValue="about">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="mt-4">
        <p className="leading-relaxed text-muted-foreground">{event.description}</p>
      </TabsContent>
      <TabsContent value="rules" className="mt-4">
        <p className="leading-relaxed text-muted-foreground">{event.rules}</p>
      </TabsContent>
      <TabsContent value="eligibility" className="mt-4">
        <p className="leading-relaxed text-muted-foreground">{event.eligibility}</p>
      </TabsContent>
    </Tabs>
  )
}
