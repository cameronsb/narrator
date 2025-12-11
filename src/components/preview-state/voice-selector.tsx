'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { VOICES, VOICE_CONFIG, type Voice } from '@/lib/types'
import { useNarratorStore } from '@/lib/store'

export function VoiceSelector() {
  const voice = useNarratorStore((s) => s.voice)
  const setVoice = useNarratorStore((s) => s.setVoice)

  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4">
        <Label className="text-base font-semibold text-white">Voice:</Label>
        <RadioGroup
          value={voice}
          onValueChange={(value) => setVoice(value as Voice)}
          className="flex flex-wrap gap-2"
        >
          {VOICES.map((voiceKey) => {
            const config = VOICE_CONFIG[voiceKey]
            return (
              <div key={voiceKey}>
                <RadioGroupItem
                  value={voiceKey}
                  id={`voice-${voiceKey}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`voice-${voiceKey}`}
                  className="cursor-pointer rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2 text-white transition-all hover:border-white/50 hover:bg-white/20 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary peer-data-[state=checked]:hover:border-white peer-data-[state=checked]:hover:bg-white/95"
                  title={config.description}
                >
                  {config.label}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>
    </div>
  )
}
