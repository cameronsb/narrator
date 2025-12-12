'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Play, Loader2, Save, RotateCcw, RotateCw, Sparkles } from 'lucide-react'
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
  const isContentDirty = useNarratorStore((s) => s.isContentDirty)
  const getContentHash = useNarratorStore((s) => s.getContentHash)
  const setLastGeneratedContentHash = useNarratorStore((s) => s.setLastGeneratedContentHash)
  const saveAsDraft = useNarratorStore((s) => s.saveAsDraft)
  const clearHistory = useNarratorStore((s) => s.clearHistory)

  // History state
  const undo = useNarratorStore((s) => s.undo)
  const redo = useNarratorStore((s) => s.redo)
  const canUndo = useNarratorStore((s) => s.canUndo)
  const canRedo = useNarratorStore((s) => s.canRedo)

  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const handleBack = () => {
    // Check if there are unsaved changes (history exists)
    if (canUndo()) {
      setShowLeaveConfirm(true)
      return
    }
    clearHistory()
    setAppState('input')
  }

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false)
    clearHistory()
    setAppState('input')
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
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

  const handleWatch = () => {
    if (!presentationData) return
    setCurrentSlide(0)
    setAppState('viewer')
  }

  const handleGenerateAudio = async () => {
    if (!presentationData) return

    setLoading(true, 'Generating audio narration...', 'Creating natural voice for each slide')
    setLoadingProgress(10)

    const scripts = [
      presentationData.metadata.titleScript,
      ...presentationData.slides.map((s) => s.script),
    ]

    // Capture the content hash before generation
    const contentHash = getContentHash()

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
      setLastGeneratedContentHash(contentHash)

      // Auto-save draft with audio to preserve expensive generated content
      saveAsDraft()

      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.success('Audio generated! Starting presentation...')
    } catch (error) {
      console.error('Error:', error)
      // Proceed without audio for demo
      setLoadingProgress(100)
      setAudioUrls({})
      setLastGeneratedContentHash(contentHash)
      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.info('Presenting without audio (API unavailable)')
    }
  }

  const isDirty = isContentDirty()

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Preview & Edit</h2>
        {/* Desktop: Show action buttons. Mobile: Hidden (actions in bottom bar) */}
        <div className="hidden gap-3 sm:flex">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Input
          </Button>

          {/* Undo/Redo buttons */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={!canUndo() || isLoading}
              className="border-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={!canRedo() || isLoading}
              className="border-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

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
            onClick={handleWatch}
            disabled={isLoading}
            variant={isDirty ? 'outline' : 'default'}
            className={
              isDirty
                ? 'border-white/30 bg-white/20 text-white hover:bg-white/30'
                : 'text-primary bg-white hover:bg-white/90'
            }
          >
            <Play className="mr-2 h-4 w-4" />
            {isDirty ? 'Preview (No Audio)' : 'Present'}
          </Button>
          <Button
            onClick={handleGenerateAudio}
            disabled={isLoading}
            variant={isDirty ? 'default' : 'outline'}
            className={
              isDirty
                ? 'text-primary bg-white hover:bg-white/90'
                : 'border-white/30 bg-white/20 text-white hover:bg-white/30'
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {isDirty ? 'Generate Audio & Present' : 'Regenerate Audio'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Leave confirmation dialog */}
      {showLeaveConfirm && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-500/20 p-4 backdrop-blur-sm">
          <p className="text-sm text-white">You have unsaved changes. Leave anyway?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelLeave}
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              Stay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmLeave}
              className="border-amber-400/50 bg-amber-500/30 text-white hover:bg-amber-500/40"
            >
              Leave
            </Button>
          </div>
        </div>
      )}

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
