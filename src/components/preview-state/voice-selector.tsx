'use client'

import { useRef, useState, useCallback } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { VOICES, VOICE_CONFIG, type Voice } from '@/lib/types'
import { useNarratorStore } from '@/lib/store'
import { Volume2, Square } from 'lucide-react'

export function VoiceSelector() {
  const voice = useNarratorStore((s) => s.voice)
  const setVoice = useNarratorStore((s) => s.setVoice)
  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePreview = useCallback(
    (voiceKey: Voice, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // If already playing this voice, stop it
      if (playingVoice === voiceKey) {
        audioRef.current?.pause()
        if (audioRef.current) {
          audioRef.current.currentTime = 0
        }
        setPlayingVoice(null)
        return
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Create and play new audio
      const audio = new Audio(`/voices/${voiceKey}.wav`)
      audioRef.current = audio
      setPlayingVoice(voiceKey)

      audio.play().catch(() => {
        setPlayingVoice(null)
      })

      audio.onended = () => {
        setPlayingVoice(null)
      }
    },
    [playingVoice]
  )

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
            const isPlaying = playingVoice === voiceKey
            return (
              <div key={voiceKey} className="group relative">
                <RadioGroupItem
                  value={voiceKey}
                  id={`voice-${voiceKey}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`voice-${voiceKey}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 py-2 pr-2 pl-4 text-white transition-all hover:border-white/50 hover:bg-white/20 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary peer-data-[state=checked]:hover:border-white peer-data-[state=checked]:hover:bg-white/95"
                  title={config.description}
                >
                  {config.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-current opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100 peer-data-[state=checked]:group-[]:hover:bg-primary/10"
                    onClick={(e) => handlePreview(voiceKey, e)}
                    aria-label={isPlaying ? `Stop ${config.label} preview` : `Preview ${config.label} voice`}
                  >
                    {isPlaying ? (
                      <Square className="h-3 w-3 fill-current" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>
    </div>
  )
}
