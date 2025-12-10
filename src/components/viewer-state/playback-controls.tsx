'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, FileText, X } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { useAudioPlayer } from '@/lib/hooks/use-audio-player'
import { useSettings } from '@/lib/hooks/use-settings'

export function PlaybackControls() {
  // Session state from Zustand
  const isPlaying = useNarratorStore((s) => s.isPlaying)
  const isMuted = useNarratorStore((s) => s.isMuted)
  const setIsMuted = useNarratorStore((s) => s.setIsMuted)
  const scriptPanelOpen = useNarratorStore((s) => s.scriptPanelOpen)
  const setScriptPanelOpen = useNarratorStore((s) => s.setScriptPanelOpen)
  const setAppState = useNarratorStore((s) => s.setAppState)

  // Persistent settings
  const { settings, setVolume, setSpeed } = useSettings()
  const { volume, speed: playbackSpeed } = settings.playback

  const { togglePlayPause, stop } = useAudioPlayer()

  const handleExit = () => {
    stop()
    setAppState('preview')
  }

  return (
    <>
      {/* Top controls */}
      <div
        className="fixed top-4 left-4 z-50 flex items-center gap-2"
        role="toolbar"
        aria-label="Playback controls"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          className="bg-white/95 shadow-lg hover:bg-white"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="bg-white/95 shadow-lg hover:bg-white"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span className="ml-2">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setScriptPanelOpen(!scriptPanelOpen)}
          aria-label={scriptPanelOpen ? 'Hide script panel' : 'Show script panel'}
          className="bg-white/95 shadow-lg hover:bg-white"
        >
          <FileText className="h-4 w-4" />
          <span className="ml-2">{scriptPanelOpen ? 'Hide Script' : 'Show Script'}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExit}
          aria-label="Exit presentation"
          className="bg-white/95 shadow-lg hover:bg-white"
        >
          <X className="h-4 w-4" />
          <span className="ml-2">Exit</span>
        </Button>
      </div>

      {/* Speed control */}
      <div className="fixed top-16 left-4 z-50 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg">
        <label className="text-primary text-sm font-semibold">Speed:</label>
        <Slider
          value={[playbackSpeed]}
          onValueChange={([value]) => setSpeed(value)}
          min={0.5}
          max={2.5}
          step={0.1}
          className="w-24"
          aria-label="Playback speed"
        />
        <span className="w-10 text-sm font-medium">{playbackSpeed.toFixed(1)}x</span>
      </div>

      {/* Volume control */}
      <div className="fixed top-28 left-4 z-50 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg">
        <Volume2 className="text-primary h-4 w-4" />
        <label className="text-primary text-sm font-semibold">Volume:</label>
        <Slider
          value={[volume]}
          onValueChange={([value]) => setVolume(value)}
          min={0}
          max={1}
          step={0.01}
          className="w-24"
          aria-label="Volume"
        />
        <span className="w-10 text-sm font-medium">{Math.round(volume * 100)}%</span>
      </div>
    </>
  )
}
