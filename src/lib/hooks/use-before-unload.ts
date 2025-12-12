'use client'

import { useEffect } from 'react'

/**
 * Hook that warns users before leaving the page with unsaved changes.
 *
 * Shows the browser's native "Leave site?" dialog when:
 * - User tries to refresh the page
 * - User tries to close the tab/window
 * - User navigates to a different URL
 *
 * @param shouldWarn - Whether to show the warning. Pass a boolean or function that returns boolean.
 */
export function useBeforeUnload(shouldWarn: boolean | (() => boolean)) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const warn = typeof shouldWarn === 'function' ? shouldWarn() : shouldWarn

      if (warn) {
        // Standard way to trigger the browser's "Leave site?" dialog
        e.preventDefault()
        // Legacy support for older browsers
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [shouldWarn])
}
