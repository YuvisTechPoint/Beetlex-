import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

function digitWidth(end: number, suffix = '') {
  const digits = String(end).length + suffix.length
  return `${Math.max(digits, 2)}ch`
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(end)
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reducedMotion) {
      setCount(end)
      return
    }

    setCount(0)
    const startTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [end, duration, reducedMotion])

  return (
    <span
      className={className}
      style={{ minWidth: digitWidth(end, suffix), display: 'inline-block' }}
    >
      <span className="tabular-nums">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </span>
    </span>
  )
}
