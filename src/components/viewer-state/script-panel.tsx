'use client'

import { useNarratorStore } from '@/lib/store'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function ScriptPanel() {
  const scriptPanelOpen = useNarratorStore((s) => s.scriptPanelOpen)
  const setScriptPanelOpen = useNarratorStore((s) => s.setScriptPanelOpen)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const getCurrentScript = useNarratorStore((s) => s.getCurrentScript)

  const script = getCurrentScript()

  return (
    <Sheet open={scriptPanelOpen} onOpenChange={setScriptPanelOpen}>
      <SheetContent className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Speaker Notes - Slide {currentSlide + 1}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <div className="bg-muted rounded-xl p-5 text-base leading-relaxed">
            {script || 'No script for this slide.'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
