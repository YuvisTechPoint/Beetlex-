import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageBackNavProps {
  to: string
  label: string
  title?: string
}

export function PageBackNav({ to, label, title }: PageBackNavProps) {
  return (
    <nav aria-label="Page navigation" className="border-b bg-muted/20">
      <div className="container mx-auto flex items-center gap-2 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link to={to}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        </Button>
        {title && (
          <>
            <span className="text-muted-foreground/50" aria-hidden="true">
              /
            </span>
            <span className="truncate text-sm text-muted-foreground">{title}</span>
          </>
        )}
      </div>
    </nav>
  )
}
