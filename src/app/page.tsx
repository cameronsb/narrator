'use client'

import { useNarratorStore } from '@/lib/store'
import { InputState } from '@/components/states/input-state'
import { PreviewState } from '@/components/states/preview-state'
import { ViewerState } from '@/components/states/viewer-state'
import { LoadingOverlay } from '@/components/loading-overlay'
import { DemoModeBanner } from '@/components/demo-mode-banner'

export default function Home() {
  const appState = useNarratorStore((s) => s.appState)

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
