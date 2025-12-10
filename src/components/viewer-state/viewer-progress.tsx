'use client'

import { useNarratorStore } from '@/lib/store'

export function ViewerProgress() {
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const totalSlides = getTotalSlides()
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-green-500 transition-all duration-300"
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
