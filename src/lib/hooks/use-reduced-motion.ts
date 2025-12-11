'use client'

import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion.
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion()
 * const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }
 */
export function useReducedMotion(): boolean {
  // Default to false on server, will be updated on client
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)
    // Set initial value
    setPrefersReducedMotion(mediaQueryList.matches)

    // Listen for changes (user can toggle this in OS settings)
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

/**
 * Helper to create motion-safe transition props for Framer Motion.
 * Returns instant transitions when reduced motion is preferred.
 */
export function getReducedMotionTransition(
  prefersReducedMotion: boolean,
  normalTransition: { duration?: number; delay?: number; ease?: string }
): { duration: number; delay?: number; ease?: string } {
  if (prefersReducedMotion) {
    return { duration: 0, delay: 0 }
  }
  return { duration: normalTransition.duration ?? 0.3, ...normalTransition }
}
