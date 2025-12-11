'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { useSettings } from '@/lib/hooks/use-settings'

/**
 * SlideNavigation - Previous/Next buttons and auto-advance toggle.
 *
 * Note: This component no longer needs audio controls. The AudioProvider
 * automatically handles playing the new slide's audio when currentSlide
 * changes while isPlaying is true.
 */
export function SlideNavigation() {
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const { settings, setAutoAdvance } = useSettings()
  const { autoAdvance } = settings.playback

  const totalSlides = getTotalSlides()
  const isFirst = currentSlide === 0
  const isLast = currentSlide === totalSlides - 1

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleNext = () => {
    if (!isLast) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
      <Button
        variant="secondary"
        onClick={handlePrevious}
        disabled={isFirst}
        aria-label="Previous slide"
        className="bg-white/95 px-6 shadow-lg hover:bg-white"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lg">
        <Checkbox
          id="auto-advance"
          checked={autoAdvance}
          onCheckedChange={(checked) => setAutoAdvance(checked === true)}
        />
        <Label htmlFor="auto-advance" className="cursor-pointer text-sm font-medium">
          Auto-advance
        </Label>
      </div>

      <Button
        variant="secondary"
        onClick={handleNext}
        disabled={isLast}
        aria-label="Next slide"
        className="bg-white/95 px-6 shadow-lg hover:bg-white"
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
