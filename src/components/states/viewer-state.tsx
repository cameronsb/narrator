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
import { AudioProvider } from '@/lib/audio'

/**
 * Inner content component that uses audio context.
 * Must be rendered inside AudioProvider to access useAudio hook.
 */
function ViewerStateContent() {
  // Keyboard navigation requires audio context, so it must be inside the provider
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

/**
 * ViewerState - Main presentation viewer component.
 *
 * Wraps all viewer content in AudioProvider to ensure a single audio element
 * is shared across all components. This prevents audio echo/layering issues
 * that occur when multiple components create their own audio elements.
 */
export function ViewerState() {
  return (
    <AudioProvider>
      <ViewerStateContent />
    </AudioProvider>
  )
}
