import { Link } from 'react-router-dom'

export function HeaderBrand() {
  return (
    <Link
      to="/"
      className="group flex h-9 items-center gap-2.5 rounded-md pr-1 transition-opacity hover:opacity-80"
      aria-label="BeetleX home"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface font-mono text-[10px] font-semibold tracking-tighter text-foreground"
        aria-hidden="true"
      >
        BX
      </span>
      <span className="text-sm font-semibold tracking-[-0.02em]">BeetleX</span>
    </Link>
  )
}
