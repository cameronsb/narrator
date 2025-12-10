'use client'

import { PreviewHeader, VoiceSelector, SlideEditor } from '@/components/preview-state'

export function PreviewState() {
  return (
    <div className="bg-surface min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <PreviewHeader />
        <VoiceSelector />
        <div className="mt-6">
          <SlideEditor />
        </div>
      </div>
    </div>
  )
}
