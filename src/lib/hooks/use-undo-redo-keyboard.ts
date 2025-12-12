'use client'

import { useEffect } from 'react'
import { useNarratorStore } from '@/lib/store'

/**
 * Keyboard shortcuts for undo/redo in the editor.
 *
 * Controls:
 * - Cmd/Ctrl+Z: Undo
 * - Cmd/Ctrl+Shift+Z: Redo
 *
 * Only active when enabled prop is true (should be disabled in viewer state).
 */
export function useUndoRedoKeyboard({ enabled = true }: { enabled?: boolean } = {}) {
  const undo = useNarratorStore((s) => s.undo)
  const redo = useNarratorStore((s) => s.redo)
  const canUndo = useNarratorStore((s) => s.canUndo)
  const canRedo = useNarratorStore((s) => s.canRedo)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Mac vs Windows/Linux
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      // Only handle Cmd/Ctrl+Z combinations
      if (!modifierKey || e.key.toLowerCase() !== 'z') return

      // Don't interfere with native undo/redo in input elements
      // The browser handles text field undo natively
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      e.preventDefault()

      if (e.shiftKey) {
        // Cmd/Ctrl+Shift+Z = Redo
        if (canRedo()) {
          redo()
        }
      } else {
        // Cmd/Ctrl+Z = Undo
        if (canUndo()) {
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, undo, redo, canUndo, canRedo])
}
