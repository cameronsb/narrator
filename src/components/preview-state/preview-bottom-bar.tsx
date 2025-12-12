'use client'

import { Button } from '@/components/ui/button'
import { Play, Loader2, Sparkles, RotateCcw, RotateCw } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PreviewBottomBarProps {
  className?: string
}

export function PreviewBottomBar({ className }: PreviewBottomBarProps) {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const voice = useNarratorStore((s) => s.voice)
  const isLoading = useNarratorStore((s) => s.isLoading)
  const setLoading = useNarratorStore((s) => s.setLoading)
  const setLoadingProgress = useNarratorStore((s) => s.setLoadingProgress)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const setAudioUrls = useNarratorStore((s) => s.setAudioUrls)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const isContentDirty = useNarratorStore((s) => s.isContentDirty)
  const getContentHash = useNarratorStore((s) => s.getContentHash)
  const setLastGeneratedContentHash = useNarratorStore((s) => s.setLastGeneratedContentHash)
  const saveAsDraft = useNarratorStore((s) => s.saveAsDraft)

  // History state
  const undo = useNarratorStore((s) => s.undo)
  const redo = useNarratorStore((s) => s.redo)
  const canUndo = useNarratorStore((s) => s.canUndo)
  const canRedo = useNarratorStore((s) => s.canRedo)

  const isDirty = isContentDirty()
  const hasHistory = canUndo() || canRedo()

  const handlePreview = () => {
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

      saveAsDraft()

      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.success('Audio generated! Starting presentation...')
    } catch (error) {
      console.error('Error:', error)
      setLoadingProgress(100)
      setAudioUrls({})
      setLastGeneratedContentHash(contentHash)
      setCurrentSlide(0)
      setLoading(false)
      setAppState('viewer')
      toast.info('Presenting without audio (API unavailable)')
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'bg-surface/95 border-t border-white/10 backdrop-blur-md',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <div className="space-y-2 p-4">
        {/* Main action row with undo/redo and primary CTA */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo buttons - only show when history exists */}
          {hasHistory && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={undo}
                disabled={!canUndo() || isLoading}
                className="h-12 w-12 border-white/30 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={!canRedo() || isLoading}
                className="h-12 w-12 border-white/30 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Primary CTA */}
          <Button
            onClick={isDirty ? handleGenerateAudio : handlePreview}
            disabled={isLoading}
            size="lg"
            className={cn(
              'h-12 flex-1 text-base font-semibold',
              'text-primary bg-white shadow-lg shadow-black/20 hover:bg-white/90'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Audio...
              </>
            ) : isDirty ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Audio & Present
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Present
              </>
            )}
          </Button>
        </div>

        {/* Secondary action - only when dirty and not loading */}
        {isDirty && !isLoading && (
          <button
            onClick={handlePreview}
            className="w-full py-1 text-center text-sm text-white/70 transition-colors hover:text-white"
          >
            Preview without audio
          </button>
        )}
      </div>
    </div>
  )
}
