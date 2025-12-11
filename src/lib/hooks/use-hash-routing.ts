'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TabId } from '@/components/home-tabs'
import type { AppState } from '@/lib/types'

// Valid hash routes
export type HashRoute =
  | '' // Same as create
  | 'create'
  | 'library'
  | 'import'
  | 'preview'
  | 'present'

/**
 * Parse the current URL hash to a route
 */
function parseHash(): HashRoute {
  if (typeof window === 'undefined') return ''

  const hash = window.location.hash
  // Remove leading #/ or # and get the route
  const route = hash.replace(/^#\/?/, '').toLowerCase()

  // Validate and return
  const validRoutes: HashRoute[] = ['', 'create', 'library', 'import', 'preview', 'present']
  if (validRoutes.includes(route as HashRoute)) {
    return route as HashRoute
  }
  return ''
}

/**
 * Convert a route to a URL hash
 */
function routeToHash(route: HashRoute): string {
  if (route === '' || route === 'create') return '#/'
  return `#/${route}`
}

/**
 * Convert a tab ID to a hash route
 */
export function tabToRoute(tab: TabId): HashRoute {
  return tab
}

/**
 * Convert a hash route to a tab ID (only for tab routes)
 */
export function routeToTab(route: HashRoute): TabId | null {
  if (route === '' || route === 'create') return 'create'
  if (route === 'library') return 'library'
  if (route === 'import') return 'import'
  return null
}

/**
 * Convert hash route to app state
 */
export function routeToAppState(route: HashRoute): AppState | null {
  if (route === '' || route === 'create' || route === 'library' || route === 'import') {
    return 'input'
  }
  if (route === 'preview') return 'preview'
  if (route === 'present') return 'viewer'
  return null
}

/**
 * Convert app state to hash route (for preview and viewer)
 */
export function appStateToRoute(appState: AppState): HashRoute | null {
  if (appState === 'preview') return 'preview'
  if (appState === 'viewer') return 'present'
  return null // Input state uses tab routes
}

interface UseHashRoutingOptions {
  defaultRoute?: HashRoute
}

/**
 * Hook to manage hash-based routing
 */
export function useHashRouting(options: UseHashRoutingOptions = {}) {
  const { defaultRoute = '' } = options
  const isInitialized = useRef(false)

  const [route, setRouteState] = useState<HashRoute>(() => {
    if (typeof window === 'undefined') return defaultRoute
    const parsed = parseHash()
    return parsed || defaultRoute
  })

  // Listen for popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const newRoute = parseHash()
      setRouteState(newRoute || defaultRoute)
    }

    // Set initial route from URL on mount
    if (!isInitialized.current) {
      isInitialized.current = true
      const initialRoute = parseHash()
      if (initialRoute) {
        setRouteState(initialRoute)
      } else {
        // Set default route in URL if none present
        window.history.replaceState(null, '', routeToHash(defaultRoute))
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [defaultRoute])

  // Update URL when route changes programmatically
  const setRoute = useCallback((newRoute: HashRoute, replace = false) => {
    const newHash = routeToHash(newRoute)
    const currentHash = window.location.hash || '#/'

    // Only update if different
    if (newHash !== currentHash) {
      if (replace) {
        window.history.replaceState(null, '', newHash)
      } else {
        window.history.pushState(null, '', newHash)
      }
    }
    setRouteState(newRoute)
  }, [])

  return { route, setRoute }
}
