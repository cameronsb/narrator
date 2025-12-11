'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useNarratorStore } from '@/lib/store'
import { InputState } from '@/components/states/input-state'
import { PreviewState } from '@/components/states/preview-state'
import { ViewerState } from '@/components/states/viewer-state'
import { LoadingOverlay } from '@/components/loading-overlay'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import { routeToAppState, appStateToRoute, type HashRoute } from '@/lib/hooks/use-hash-routing'

export default function Home() {
  const appState = useNarratorStore((s) => s.appState)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const savedPresentations = useNarratorStore((s) => s.savedPresentations)

  // Track if the last navigation was from URL (browser back/forward)
  const isFromUrl = useRef(false)
  const prevAppState = useRef(appState)

  // Get default route based on saved presentations
  const getDefaultRoute = useCallback((): HashRoute => {
    return savedPresentations.length > 0 ? 'library' : 'create'
  }, [savedPresentations.length])

  // Parse current URL hash
  const parseHash = useCallback((): HashRoute => {
    if (typeof window === 'undefined') return ''
    const hash = window.location.hash
    const route = hash.replace(/^#\/?/, '').toLowerCase()
    const validRoutes: HashRoute[] = ['', 'create', 'library', 'import', 'preview', 'present']
    return validRoutes.includes(route as HashRoute) ? (route as HashRoute) : ''
  }, [])

  // Update URL hash
  const updateHash = useCallback((route: HashRoute, replace = false) => {
    const hash = route === '' || route === 'create' ? '#/' : `#/${route}`
    const currentHash = window.location.hash || '#/'
    if (hash !== currentHash) {
      if (replace) {
        window.history.replaceState(null, '', hash)
      } else {
        window.history.pushState(null, '', hash)
      }
    }
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isFromUrl.current = true
      const route = parseHash()
      const targetAppState = routeToAppState(route)
      if (targetAppState) {
        setAppState(targetAppState)
      }
    }

    // Set initial URL on mount if no hash
    if (typeof window !== 'undefined') {
      const initialRoute = parseHash()
      if (!initialRoute) {
        updateHash(getDefaultRoute(), true)
      } else {
        // Sync initial URL to appState
        const targetAppState = routeToAppState(initialRoute)
        if (targetAppState && targetAppState !== appState) {
          setAppState(targetAppState)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [parseHash, updateHash, getDefaultRoute, setAppState, appState])

  // Update URL when appState changes (from programmatic navigation)
  useEffect(() => {
    // Skip if this change came from URL navigation
    if (isFromUrl.current) {
      isFromUrl.current = false
      prevAppState.current = appState
      return
    }

    // Only update URL for preview/viewer states (input state uses tabs with their own routing)
    const targetRoute = appStateToRoute(appState)
    if (targetRoute) {
      updateHash(targetRoute)
    }

    prevAppState.current = appState
  }, [appState, updateHash])

  return (
    <>
      <LoadingOverlay />
      <DemoModeBanner />

      {appState === 'input' && <InputState />}
      {appState === 'preview' && <PreviewState />}
      {appState === 'viewer' && <ViewerState />}
    </>
  )
}
