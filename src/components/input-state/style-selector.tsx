'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { STYLES, STYLE_CONFIG, type Style } from '@/lib/types'
import { useNarratorStore } from '@/lib/store'

export function StyleSelector() {
  const style = useNarratorStore((s) => s.style)
  const setStyle = useNarratorStore((s) => s.setStyle)

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Presentation Style</Label>
      <RadioGroup
        value={style}
        onValueChange={(value) => setStyle(value as Style)}
        className="grid grid-cols-2 gap-3"
      >
        {STYLES.map((styleKey) => {
          const config = STYLE_CONFIG[styleKey]
          return (
            <div key={styleKey}>
              <RadioGroupItem value={styleKey} id={styleKey} className="peer sr-only" />
              <Label
                htmlFor={styleKey}
                className="hover:border-primary/50 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all"
              >
                <span className="font-semibold">{config.label}</span>
                <span className="text-muted-foreground text-sm">{config.description}</span>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
