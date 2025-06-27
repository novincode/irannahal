'use client'
import { useState, useEffect, useCallback } from 'react'

interface UseCountdownOptions {
  initialTime: number
  onComplete?: () => void
  autoStart?: boolean
}

export function useCountdown({ 
  initialTime, 
  onComplete, 
  autoStart = false 
}: UseCountdownOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(autoStart)

  const start = useCallback((time?: number) => {
    if (time !== undefined) {
      setTimeLeft(time)
    }
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback((time?: number) => {
    setIsActive(false)
    setTimeLeft(time !== undefined ? time : initialTime)
  }, [initialTime])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, timeLeft, onComplete])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset,
    formatTime: () => formatTime(timeLeft),
    isCompleted: timeLeft === 0,
  }
}
