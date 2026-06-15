import { useEffect, useRef, useCallback } from 'react'

type GameLoopCallback = (deltaTime: number, timestamp: number) => void

export function useGameLoop(
  callback: GameLoopCallback,
  isRunning: boolean = true
): {
  start: () => void
  stop: () => void
  isRunningRef: React.MutableRefObject<boolean>
} {
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number>(0)
  const isRunningRef = useRef<boolean>(isRunning)
  const callbackRef = useRef<GameLoopCallback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  const animate = useCallback((timestamp: number) => {
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = timestamp
    }

    const deltaTime = timestamp - previousTimeRef.current
    previousTimeRef.current = timestamp

    if (isRunningRef.current) {
      callbackRef.current(deltaTime, timestamp)
    }

    requestRef.current = requestAnimationFrame(animate)
  }, [])

  const start = useCallback(() => {
    isRunningRef.current = true
    if (requestRef.current === null) {
      previousTimeRef.current = 0
      requestRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  const stop = useCallback(() => {
    isRunningRef.current = false
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      start()
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [isRunning, start, stop])

  return { start, stop, isRunningRef }
}
