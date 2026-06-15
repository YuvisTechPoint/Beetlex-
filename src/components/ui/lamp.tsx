import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const lampTransition = {
  delay: 0.3,
  duration: 0.8,
  ease: 'easeInOut' as const,
}

type HeroBeamMetrics = {
  width: number | null
  /** Nav left edge relative to the header element */
  offsetLeft: number | null
}

const emptyMetrics: HeroBeamMetrics = { width: null, offsetLeft: null }

const HeroBeamContext = createContext<{
  metrics: HeroBeamMetrics
  setMetrics: (metrics: HeroBeamMetrics) => void
} | null>(null)

export function HeroBeamWidthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HeroBeamMetrics>(emptyMetrics)
  return (
    <HeroBeamContext.Provider value={{ metrics, setMetrics }}>{children}</HeroBeamContext.Provider>
  )
}

export function useHeroBeamMetrics() {
  return useContext(HeroBeamContext)?.metrics ?? emptyMetrics
}

/** @deprecated Use useHeroBeamMetrics().width */
export function useHeroBeamWidth() {
  return useHeroBeamMetrics().width
}

export function useHeroNavBeam(
  navRef: React.RefObject<HTMLElement | null>,
  headerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const setMetrics = useContext(HeroBeamContext)?.setMetrics

  useEffect(() => {
    if (!enabled || !setMetrics) return

    const update = () => {
      const nav = navRef.current
      const header = headerRef.current
      if (!nav || !header) {
        setMetrics(emptyMetrics)
        return
      }

      const navRect = nav.getBoundingClientRect()
      const headerRect = header.getBoundingClientRect()
      setMetrics({
        width: navRect.width,
        offsetLeft: navRect.left - headerRect.left,
      })
    }

    update()

    const observer = new ResizeObserver(update)
    if (navRef.current) observer.observe(navRef.current)
    if (headerRef.current) observer.observe(headerRef.current)
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      setMetrics(emptyMetrics)
    }
  }, [enabled, navRef, headerRef, setMetrics])
}

interface HeroBeamLineProps {
  className?: string
  width?: number | null
  animate?: boolean
}

export function HeroBeamLine({ className, width, animate = true }: HeroBeamLineProps) {
  const contextWidth = useHeroBeamMetrics().width
  const lineWidth = width ?? contextWidth

  if (!lineWidth) return null

  const lineClass = cn(
    'h-px bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.55)]',
    className,
  )

  if (!animate) {
    return <div className={lineClass} style={{ width: lineWidth }} aria-hidden="true" />
  }

  return (
    <motion.div
      initial={{ opacity: 0.5, scaleX: 0.85 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={lampTransition}
      className={cn(lineClass, 'origin-left')}
      style={{ width: lineWidth }}
      aria-hidden="true"
    />
  )
}

function HeroAtmosphere({ headerHeight = '3.5rem' }: { headerHeight?: string }) {
  const { width, offsetLeft } = useHeroBeamMetrics()
  const rootRef = useRef<HTMLDivElement>(null)
  const [beamLeft, setBeamLeft] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (width == null || offsetLeft == null || !rootRef.current) {
      setBeamLeft(null)
      return
    }

    const sync = () => {
      const header = headerRefFromDom()
      const root = rootRef.current
      if (!header || !root) return
      const headerRect = header.getBoundingClientRect()
      const rootRect = root.getBoundingClientRect()
      setBeamLeft(headerRect.left + offsetLeft - rootRect.left)
    }

    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [width, offsetLeft])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-0 z-0 mx-auto h-[min(36rem,52vh)] w-full"
      style={{ top: headerHeight }}
      aria-hidden="true"
    >
      <div className="hero-glow-layer absolute inset-0 bg-[radial-gradient(ellipse_130%_95%_at_50%_0%,hsl(var(--primary)/0.16)_0%,hsl(var(--primary)/0.06)_38%,transparent_68%)]" />
      <div className="hero-glow-layer absolute left-1/2 top-0 h-full w-[min(130vw,96rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_42%_85%_at_50%_0%,hsl(var(--primary)/0.42)_0%,hsl(var(--primary)/0.18)_28%,hsl(var(--primary)/0.06)_48%,transparent_72%)]" />
      <motion.div
        initial={{ opacity: 0.55, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={lampTransition}
        className="absolute left-1/2 top-[1%] h-[min(20rem,38vh)] w-[min(44rem,98vw)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.5)_0%,hsl(var(--primary)/0.16)_42%,transparent_72%)] blur-2xl sm:blur-3xl"
      />
      <div className="absolute left-1/2 top-[3%] h-[min(24rem,44vh)] w-[min(60rem,115vw)] -translate-x-1/2 rounded-full bg-orange-500/14 blur-[72px] sm:blur-[100px]" />
      <div className="absolute left-1/2 top-[5%] h-36 w-[min(32rem,85vw)] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl sm:h-44" />
      {beamLeft != null && width != null && (
        <div
          className="absolute top-0 z-50 -translate-y-px"
          style={{ left: beamLeft, width }}
        >
          <HeroBeamLine width={width} />
        </div>
      )}
      <div className="absolute left-1/2 top-[36%] h-40 w-full max-w-3xl -translate-x-1/2 translate-y-6 scale-x-125 bg-background blur-2xl sm:h-48 sm:translate-y-10" />
      <div className="absolute inset-x-0 bottom-0 z-40 h-28 bg-gradient-to-b from-transparent via-background/50 to-background sm:h-36" />
      <div className="hero-glow-layer absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_42%,transparent_28%,hsl(var(--background)/0.88)_100%)]" />
    </div>
  )
}

function headerRefFromDom() {
  return document.querySelector('header')
}

export function HeroLightAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-glow-layer absolute inset-0 bg-[radial-gradient(ellipse_120%_85%_at_50%_-8%,hsl(var(--primary)/0.14)_0%,hsl(var(--primary)/0.05)_40%,transparent_68%)]" />
      <div className="hero-glow-layer absolute left-1/2 top-0 h-[min(28rem,48vh)] w-[min(110vw,80rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_48%_75%_at_50%_0%,hsl(var(--primary)/0.1)_0%,hsl(var(--primary)/0.04)_45%,transparent_70%)]" />
      <div className="absolute left-1/2 top-[4%] h-52 w-[min(40rem,92vw)] -translate-x-1/2 rounded-full bg-orange-400/12 blur-3xl" />
      <div className="absolute left-1/2 top-[6%] h-40 w-[min(28rem,80vw)] -translate-x-1/2 rounded-full bg-amber-300/10 blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background sm:h-32" />
    </div>
  )
}

interface LampContainerProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function LampContainer({ children, className, contentClassName }: LampContainerProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center overflow-hidden bg-background',
        className,
      )}
    >
      <HeroAtmosphere />
      <div
        className={cn(
          'relative z-10 flex w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
