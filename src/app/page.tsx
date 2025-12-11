'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNarratorStore, waitForHydration } from '@/lib/store'
import { InputState } from '@/components/states/input-state'
import { PreviewState } from '@/components/states/preview-state'
import { ViewerState } from '@/components/states/viewer-state'
import { LoadingOverlay } from '@/components/loading-overlay'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import type { TabId } from '@/components/home-tabs'
import { toast } from 'sonner'

/**
 * Centralized URL Routing
 *
 * All routes:
 * - /#/ or /#/create → appState='input', activeTab='create'
 * - /#/library → appState='input', activeTab='library'
 * - /#/import → appState='input', activeTab='import'
 * - /#/preview → appState='preview'
 * - /#/present → appState='viewer'
 */

type Route = 'create' | 'library' | 'import' | 'preview' | 'present'

function parseRoute(): Route | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  const validRoutes: Route[] = ['create', 'library', 'import', 'preview', 'present']
  if (hash === '') return 'create'
  return validRoutes.includes(hash as Route) ? (hash as Route) : null
}

function setRoute(route: Route, replace = false) {
  const hash = route === 'create' ? '#/' : `#/${route}`
  if (window.location.hash !== hash) {
    if (replace) {
      window.history.replaceState(null, '', hash)
    } else {
      window.history.pushState(null, '', hash)
    }
  }
}

function routeToAppState(route: Route): 'input' | 'preview' | 'viewer' {
  if (route === 'create' || route === 'library' || route === 'import') return 'input'
  if (route === 'preview') return 'preview'
  return 'viewer'
}

function routeToTab(route: Route): TabId | null {
  if (route === 'create' || route === 'library' || route === 'import') return route
  return null
}

export default function Home() {
  const appState = useNarratorStore((s) => s.appState)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const savedPresentations = useNarratorStore((s) => s.savedPresentations)
  const tryRecoverSession = useNarratorStore((s) => s.tryRecoverSession)

  // Active tab state (only relevant when appState === 'input')
  const defaultTab: TabId = savedPresentations.length > 0 ? 'library' : 'create'
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)

  // Refs to track initialization and prevent loops
  const hasInitialized = useRef(false)
  const lastRoute = useRef<Route | null>(null)

  // Sync URL → state on mount and popstate
  const syncFromUrl = useCallback(
    (isInitial = false) => {
      const route = parseRoute()
      if (!route) {
        // Invalid/empty route, redirect to default
        setRoute(defaultTab, true)
        setActiveTab(defaultTab)
        return
      }

      // Avoid redundant updates
      if (route === lastRoute.current && !isInitial) return

      const targetAppState = routeToAppState(route)
      const targetTab = routeToTab(route)

      // Route guard: preview and present routes require presentation data
      if (targetAppState === 'preview' || targetAppState === 'viewer') {
        const store = useNarratorStore.getState()

        // Check if we have presentation data in memory
        if (!store.presentationData) {
          // Try to recover from persisted session
          const recovered = tryRecoverSession()

          if (!recovered) {
            // No data and no recoverable session - redirect to library
            const redirectTab = savedPresentations.length > 0 ? 'library' : 'create'
            setRoute(redirectTab, true)
            setActiveTab(redirectTab)
            setAppState('input')
            lastRoute.current = redirectTab

            // Show feedback to user
            if (savedPresentations.length > 0) {
              toast.info('No presentation loaded', {
                description: 'Choose a presentation from your library to continue.',
              })
            } else {
              toast.info('No presentation loaded', {
                description: 'Create a new presentation to get started.',
              })
            }
            return
          }
          // Session recovered successfully, continue with navigation
        }
      }

      lastRoute.current = route

      // Update app state if needed
      const currentAppState = useNarratorStore.getState().appState
      if (targetAppState !== currentAppState) {
        setAppState(targetAppState)
      }

      // Update tab if this is a tab route
      if (targetTab) {
        setActiveTab(targetTab)
      }
    },
    [defaultTab, setAppState, tryRecoverSession, savedPresentations.length]
  )

  // Initial mount: wait for store hydration, then sync from URL
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Wait for IndexedDB data to be loaded before checking routes
    waitForHydration().then(() => {
      syncFromUrl(true)
    })
  }, [syncFromUrl])

  // Browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      syncFromUrl()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncFromUrl])

  // Handle tab changes (called from InputState)
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setRoute(tab)
    lastRoute.current = tab
  }, [])

  // Handle navigation to preview/present from child components
  // This effect syncs appState changes that originate from the store (e.g., loadPresentation)
  useEffect(() => {
    // Determine what route the current appState should have
    let expectedRoute: Route
    if (appState === 'input') {
      expectedRoute = activeTab
    } else if (appState === 'preview') {
      expectedRoute = 'preview'
    } else {
      expectedRoute = 'present'
    }

    // Only update URL if it doesn't match
    if (expectedRoute !== lastRoute.current) {
      setRoute(expectedRoute)
      lastRoute.current = expectedRoute
    }
  }, [appState, activeTab])

  return (
    <>
      <LoadingOverlay />
      <DemoModeBanner />

      {appState === 'input' && (
        <InputState activeTab={activeTab} onTabChange={handleTabChange} />
      )}
      {appState === 'preview' && <PreviewState />}
      {appState === 'viewer' && <ViewerState />}
    </>
  )
}
