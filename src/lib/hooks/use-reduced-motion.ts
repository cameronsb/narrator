'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(QUERY)
  mediaQueryList.addEventListener('change', callback)
  return () => mediaQueryList.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  return false // Default to no reduced motion on server
}

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion.
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion()
 * const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
