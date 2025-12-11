'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { useAudio } from '@/lib/audio'

export function ViewerProgress() {
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const totalSlides = getTotalSlides()
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0

  return (
    <div
      className="fixed top-0 left-0 z-40 h-1 bg-green-500 transition-all duration-300"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={currentSlide + 1}
      aria-valuemin={1}
      aria-valuemax={totalSlides}
      aria-label="Presentation progress"
    />
  )
}

export function ViewerCounter() {
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const totalSlides = getTotalSlides()

  return (
    <div className="fixed top-4 right-4 z-50 rounded-full bg-white/95 px-4 py-2 font-semibold shadow-lg">
      {currentSlide + 1} / {totalSlides}
    </div>
  )
}

export function ViewerTopBar() {
  const setAppState = useNarratorStore((s) => s.setAppState)
  const { stop } = useAudio()

  const handleExit = () => {
    stop()
    setAppState('preview')
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExit}
        aria-label="Exit presentation"
        className="bg-white/95 shadow-lg hover:bg-white"
      >
        <X className="h-4 w-4" />
        <span className="ml-2">Exit</span>
      </Button>
    </div>
  )
}
