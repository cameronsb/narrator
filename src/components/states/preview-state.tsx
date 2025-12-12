'use client'

import {
  PreviewHeader,
  VoiceSelector,
  SlideEditor,
  PreviewBottomBar,
} from '@/components/preview-state'
import { useBeforeUnload } from '@/lib/hooks/use-before-unload'
import { useUndoRedoKeyboard } from '@/lib/hooks/use-undo-redo-keyboard'
import { useNarratorStore } from '@/lib/store'

export function PreviewState() {
  const canUndo = useNarratorStore((s) => s.canUndo)

  // Warn before browser close/refresh if there are unsaved changes
  useBeforeUnload(() => canUndo())

  // Enable keyboard shortcuts for undo/redo
  useUndoRedoKeyboard({ enabled: true })

  return (
    <div className="bg-surface min-h-screen">
      {/* Content with bottom padding for mobile action bar */}
      <div className="p-4 pb-36 sm:p-8 sm:pb-8">
        <div className="mx-auto max-w-4xl">
          <PreviewHeader />
          <VoiceSelector />
          <div className="mt-6">
            <SlideEditor />
          </div>
        </div>
      </div>

      {/* Mobile-only sticky bottom action bar */}
      <PreviewBottomBar className="sm:hidden" />
    </div>
  )
}
