'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useNarratorStore } from '@/lib/store'
import { useSettings } from '@/lib/hooks/use-settings'

/**
 * Exponential volume scaling for more natural volume control.
 * Maps linear slider value to exponential curve:
 * - 0 → silent
 * - ~0.63 → unity gain
 * - 1.0 → maximum
 */
function calculateVolume(sliderValue: number): number {
  const maxGain = 1.0
  const exponent = 2.0
  return Math.max(0, maxGain * Math.pow(sliderValue, exponent))
}

interface AudioContextValue {
  play: () => void
  pause: () => void
  stop: () => void
  togglePlayPause: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

/**
 * AudioProvider - Centralized audio management for the presentation viewer.
 *
 * This provider owns a single HTMLAudioElement and reacts to store state changes.
 * All audio playback flows through this single element, preventing the echo/layering
 * issues that occur when multiple components create their own audio elements.
 *
 * Architecture:
 * - Single audio element (singleton pattern)
 * - Reactive to store state (currentSlide, isPlaying, audioUrls)
 * - Separate effects for settings (volume, speed, mute) to avoid playback restarts
 * - Clean separation: components update state, provider handles audio
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Store state subscriptions
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const audioUrls = useNarratorStore((s) => s.audioUrls)
  const isPlaying = useNarratorStore((s) => s.isPlaying)
  const isMuted = useNarratorStore((s) => s.isMuted)
  const setIsPlaying = useNarratorStore((s) => s.setIsPlaying)
  const setCurrentSlide = useNarratorStore((s) => s.setCurrentSlide)
  const getTotalSlides = useNarratorStore((s) => s.getTotalSlides)

  // Persistent settings
  const { settings } = useSettings()
  const { volume, speed: playbackSpeed, autoAdvance } = settings.playback

  // Initialize single audio element on mount
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    // Cleanup on unmount
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Handle audio 'ended' event for auto-advance
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      const total = getTotalSlides()
      if (autoAdvance && currentSlide < total - 1) {
        // Brief pause before advancing for smoother UX
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1)
        }, 800)
      } else {
        // End of presentation or auto-advance disabled
        setIsPlaying(false)
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentSlide, autoAdvance, getTotalSlides, setCurrentSlide, setIsPlaying])

  /**
   * Main playback effect - responds to isPlaying and currentSlide changes.
   *
   * Key behaviors:
   * - When isPlaying becomes true: play current slide's audio from start
   * - When currentSlide changes while playing: switch to new slide's audio
   * - When isPlaying becomes false: pause immediately
   *
   * Note: Settings (volume, speed, mute) are intentionally excluded from
   * dependencies to prevent playback restarts when adjusting settings.
   * Separate effects handle real-time settings updates.
   */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const audioUrl = audioUrls[currentSlide]

    if (isPlaying && audioUrl) {
      // Update source if different (also resets currentTime to 0)
      if (audio.src !== audioUrl) {
        audio.src = audioUrl
      } else {
        // Same audio, restart from beginning for consistent behavior
        audio.currentTime = 0
      }

      // Apply current settings before playing
      audio.playbackRate = playbackSpeed
      audio.muted = isMuted
      audio.volume = calculateVolume(volume)

      // Play with error handling for browser autoplay policies
      audio.play().catch((err) => {
        // AbortError is expected when rapidly changing slides
        if (err.name !== 'AbortError') {
          console.error('Audio playback error:', err)
        }
      })
    } else {
      // Pause immediately when isPlaying is false or no audio available
      audio.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Settings handled by dedicated effects below
  }, [isPlaying, currentSlide, audioUrls])

  // Real-time playback speed updates (without restarting audio)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // Real-time mute state updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Real-time volume updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = calculateVolume(volume)
    }
  }, [volume])

  // Control functions exposed via context
  const play = useCallback(() => {
    setIsPlaying(true)
  }, [setIsPlaying])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [setIsPlaying])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setIsPlaying(false)
  }, [setIsPlaying])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying, setIsPlaying])

  const value: AudioContextValue = {
    play,
    pause,
    stop,
    togglePlayPause,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

/**
 * Hook to access audio controls from the AudioProvider.
 * Must be used within an AudioProvider.
 */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
