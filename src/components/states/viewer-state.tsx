'use client'

import {
  PlaybackControls,
  SlideDisplay,
  SlideNavigation,
  ScriptPanel,
  ViewerProgress,
  ViewerCounter,
  ViewerIntro,
} from '@/components/viewer-state'
import { useKeyboardNavigation } from '@/lib/hooks/use-keyboard-navigation'

export function ViewerState() {
  // Enable keyboard navigation
  useKeyboardNavigation()

  return (
    <div className="bg-surface min-h-screen">
      <ViewerIntro />
      <ViewerProgress />
      <ViewerCounter />
      <PlaybackControls />
      <SlideDisplay />
      <SlideNavigation />
      <ScriptPanel />
    </div>
  )
}
