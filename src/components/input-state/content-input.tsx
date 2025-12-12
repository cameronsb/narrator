'use client'

import { Textarea } from '@/components/ui/textarea'
import { useNarratorStore } from '@/lib/store'

export function ContentInput() {
  const content = useNarratorStore((s) => s.content)
  const setContent = useNarratorStore((s) => s.setContent)

  return (
    <div className="space-y-3">
      <label htmlFor="content-input" className="text-lg font-semibold">
        What would you like to present?
      </label>
      <Textarea
        id="content-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your meeting notes, article, outline, or any text..."
        className="min-h-[200px] resize-y text-base"
      />
      <p className="text-muted-foreground text-xs">{content.length} characters</p>
    </div>
  )
}
