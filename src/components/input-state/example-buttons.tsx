'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EXAMPLES, type ExampleKey } from '@/lib/types'
import { useNarratorStore } from '@/lib/store'

const EXAMPLE_LABELS: Record<ExampleKey, string> = {
  startup: 'Startup Pitch',
  quarterly: 'Quarterly Review',
  tutorial: 'Technical Tutorial',
}

export function ExampleButtons() {
  const setContent = useNarratorStore((s) => s.setContent)

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Or try an example</Label>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(EXAMPLES) as ExampleKey[]).map((key) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => setContent(EXAMPLES[key])}
            className="text-muted-foreground hover:text-primary hover:border-primary"
          >
            {EXAMPLE_LABELS[key]}
          </Button>
        ))}
      </div>
    </div>
  )
}
