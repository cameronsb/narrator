'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Play, Loader2, Save } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { toast } from 'sonner'
import { useState } from 'react'

export function PreviewHeader() {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const voice = useNarratorStore((s) => s.voice)
  const isLoading = useNarratorStore((s) => s.isLoading)
  const setLoading = useNarratorStore((s) => s.setLoading)
  const setLoadingProgress = useNarratorStore((s) => s.setLoadingProgress)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const setAudioUrls = useNarratorStore((s) => s.setAudioUrls)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const saveCurrentPresentation = useNarratorStore((s) => s.saveCurrentPresentation)

  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')

  const handleBack = () => {
    setAppState('input')
  }

  const handleSave = () => {
    if (!showSaveInput) {
      setShowSaveInput(true)
      setSaveName(presentationData?.metadata.title || '')
      return
    }

    if (!saveName.trim()) {
      toast.error('Please enter a name for your presentation')
      return
    }

    saveCurrentPresentation(saveName.trim())
    toast.success(`Saved "${saveName.trim()}"`)
    setShowSaveInput(false)
    setSaveName('')
  }

  const handleCancelSave = () => {
    setShowSaveInput(false)
    setSaveName('')
  }

  const handleGenerateAudio = async () => {
    if (!presentationData) return

    setLoading(true, 'Generating audio narration...', 'Creating natural voice for each slide')
    setLoadingProgress(10)

    const scripts = [
      presentationData.metadata.titleScript,
      ...presentationData.slides.map((s) => s.script),
    ]

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scripts, voice }),
      })

      setLoadingProgress(90)

      if (!response.ok) throw new Error('Failed to generate audio')

      const { audioUrls } = await response.json()
      const urlMap: Record<number, string> = {}
      audioUrls.forEach((url: string, i: number) => {
        urlMap[i] = url
      })

      setLoadingProgress(100)
      setAudioUrls(urlMap)
      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.success('Audio generated! Starting presentation...')
    } catch (error) {
      console.error('Error:', error)
      // Proceed without audio for demo
      setLoadingProgress(100)
      setAudioUrls({})
      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.info('Presenting without audio (API unavailable)')
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Preview & Edit</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Input
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isLoading}
            className="border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            <Save className="mr-2 h-4 w-4" />
            {showSaveInput ? 'Confirm Save' : 'Save'}
          </Button>
          <Button
            onClick={handleGenerateAudio}
            disabled={isLoading}
            className="text-primary bg-white hover:bg-white/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Audio & Present
              </>
            )}
          </Button>
        </div>
      </div>

      {showSaveInput && (
        <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
          <Input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancelSave()
            }}
            placeholder="Enter presentation name..."
            className="bg-white/90 text-gray-900 placeholder:text-gray-500"
            autoFocus
          />
          <Button
            variant="outline"
            onClick={handleCancelSave}
            className="shrink-0 border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
