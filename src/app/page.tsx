'use client'

import { useEffect, useRef } from 'react'
import { useNarratorStore } from '@/lib/store'
import { InputState } from '@/components/states/input-state'
import { PreviewState } from '@/components/states/preview-state'
import { ViewerState } from '@/components/states/viewer-state'
import { LoadingOverlay } from '@/components/loading-overlay'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import {
  useHashRouting,
  routeToAppState,
  appStateToRoute,
  type HashRoute,
} from '@/lib/hooks/use-hash-routing'

export default function Home() {
  const appState = useNarratorStore((s) => s.appState)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const savedPresentations = useNarratorStore((s) => s.savedPresentations)

  // Determine default route based on whether user has saved presentations
  const defaultRoute: HashRoute = savedPresentations.length > 0 ? 'library' : 'create'
  const { route, setRoute } = useHashRouting({ defaultRoute })

  // Track if we're syncing to avoid loops
  const isSyncing = useRef(false)

  // Sync route -> appState (when URL changes via back/forward)
  useEffect(() => {
    if (isSyncing.current) return

    const targetAppState = routeToAppState(route)
    if (targetAppState && targetAppState !== appState) {
      isSyncing.current = true
      setAppState(targetAppState)
      // Reset sync flag after state update
      requestAnimationFrame(() => {
        isSyncing.current = false
      })
    }
  }, [route, appState, setAppState])

  // Sync appState -> route (when app navigates programmatically)
  useEffect(() => {
    if (isSyncing.current) return

    const targetRoute = appStateToRoute(appState)
    if (targetRoute && targetRoute !== route) {
      isSyncing.current = true
      setRoute(targetRoute)
      requestAnimationFrame(() => {
        isSyncing.current = false
      })
    }
  }, [appState, route, setRoute])

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
