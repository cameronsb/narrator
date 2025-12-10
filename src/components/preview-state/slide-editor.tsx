'use client'

import { useNarratorStore } from '@/lib/store'
import { SlideCard } from './slide-card'

export function SlideEditor() {
  const presentationData = useNarratorStore((s) => s.presentationData)

  if (!presentationData) return null

  return (
    <div className="space-y-5">
      {/* Title slide */}
      <SlideCard index={0} isTitle />

      {/* Content slides */}
      {presentationData.slides.map((_, index) => (
        <SlideCard key={index} index={index} />
      ))}
    </div>
  )
}
