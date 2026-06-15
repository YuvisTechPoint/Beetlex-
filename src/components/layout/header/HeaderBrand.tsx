import { Link } from 'react-router-dom'
import { Bug } from 'lucide-react'

export function HeaderBrand() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 rounded-lg py-1 pr-2 transition-colors hover:text-primary"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
        <Bug className="h-4 w-4 text-primary" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight">BeetleX</span>
    </Link>
  )
}
