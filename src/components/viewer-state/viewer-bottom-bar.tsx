'use client'

import { Button } from '@/components/ui/button'
import { Play, Pause, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { useAudio } from '@/lib/audio'
import { SettingsPopover } from './settings-popover'

export function ViewerBottomBar() {
  const isPlaying = useNarratorStore((s) => s.isPlaying)
  const scriptPanelOpen = useNarratorStore((s) => s.scriptPanelOpen)
  const setScriptPanelOpen = useNarratorStore((s) => s.setScriptPanelOpen)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  const { togglePlayPause } = useAudio()

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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-2 bg-slate-900/95 px-4 py-3 backdrop-blur-sm sm:px-6"
      role="toolbar"
      aria-label="Presentation controls"
    >
      {/* Left section: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirst}
          aria-label="Previous slide"
          className="bg-white/10 text-white hover:bg-white/20 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={isLast}
          aria-label="Next slide"
          className="bg-white/10 text-white hover:bg-white/20 hover:text-white disabled:opacity-30"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section: Play/Pause, Settings, Script */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>

        <SettingsPopover />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setScriptPanelOpen(!scriptPanelOpen)}
          aria-label={scriptPanelOpen ? 'Hide script panel' : 'Show script panel'}
          className={`bg-white/10 text-white hover:bg-white/20 hover:text-white ${scriptPanelOpen ? 'bg-white/20' : ''}`}
        >
          <FileText className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Script</span>
        </Button>
      </div>

      {/* Right section: spacer for balance */}
      <div className="hidden w-[140px] sm:block" />
    </div>
  )
}
