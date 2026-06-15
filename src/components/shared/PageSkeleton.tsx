import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-8" role="status" aria-label="Loading page">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
