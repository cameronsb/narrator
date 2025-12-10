'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useNarratorStore } from '@/lib/store'

export function ContentInput() {
  const content = useNarratorStore((s) => s.content)
  const setContent = useNarratorStore((s) => s.setContent)

  return (
    <div className="space-y-3">
      <Label htmlFor="content-input" className="text-base font-semibold">
        Your Content
      </Label>
      <Textarea
        id="content-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your meeting notes, article, outline, or any text content here...

The AI will structure it into clear slides and generate natural voice narration."
        className="min-h-[250px] resize-y text-base"
      />
      <p className="text-muted-foreground text-sm">
        {content.length > 0
          ? `${content.length} characters`
          : 'Enter at least 100 characters for best results'}
      </p>
    </div>
  )
}
