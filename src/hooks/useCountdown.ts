import { useEffect, useState } from 'react'

export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  isComplete: boolean
  isExpired: boolean
}

function computeTimeLeft(target: Date): CountdownTime {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isComplete: true,
      isExpired: true,
    }
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
    isComplete: false,
    isExpired: false,
  }
}

export function useCountdown(targetDate: string | Date | undefined): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() =>
    targetDate
      ? computeTimeLeft(new Date(targetDate))
      : {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isComplete: true,
          isExpired: true,
        },
  )

  useEffect(() => {
    if (!targetDate) return

    const target = new Date(targetDate)

    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(target))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}
