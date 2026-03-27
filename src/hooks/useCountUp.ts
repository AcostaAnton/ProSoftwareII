import { useEffect, useState } from 'react'

const DEFAULT_MS = 900

/**
 * Número que sube de 0 al valor final en ~durationMs (efecto “odómetro” claramente visible).
 */
export function useCountUp(target: number, durationMs: number = DEFAULT_MS): number {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setDisplay(0)
      return
    }

    setDisplay(0)

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed >= durationMs) {
        setDisplay(target)
        return
      }
      const t = elapsed / durationMs
      const eased = 1 - (1 - t) * (1 - t)
      setDisplay(Math.round(target * eased))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return display
}
