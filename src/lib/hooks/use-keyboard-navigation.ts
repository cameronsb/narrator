'use client'

import { useEffect } from 'react'
import { useNarratorStore } from '@/lib/store'
import { useAudio } from '@/lib/audio'

/**
 * Keyboard navigation hook for the presentation viewer.
 *
 * Controls:
 * - ArrowLeft: Previous slide
 * - ArrowRight: Next slide
 * - Space: Toggle play/pause
 * - Escape: Stop and exit to preview
 *
 * Note: Arrow keys only update currentSlide; the AudioProvider automatically
 * handles playing the new slide's audio when navigating while playing.
 */
export function useKeyboardNavigation() {
  const appState = useNarratorStore((s) => s.appState)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const { togglePlayPause, stop } = useAudio()

  useEffect(() => {
    if (appState !== 'viewer') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const total = getTotalSlides()

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          if (currentSlide < total - 1) {
            setCurrentSlide(currentSlide + 1)
          }
          break

        case ' ':
          e.preventDefault()
          togglePlayPause()
          break

        case 'Escape':
          e.preventDefault()
          stop()
          setAppState('preview')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    appState,
    currentSlide,
    getTotalSlides,
    setCurrentSlide,
    setAppState,
    togglePlayPause,
    stop,
  ])
}
