'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useNarratorStore } from '@/lib/store'
import { useSettings } from '@/lib/hooks/use-settings'

// Exponential volume scaling: 0→silent, ~63%→unity, 100%→max
function calculateVolume(sliderValue: number): number {
  const maxGain = 1.0 // For HTML5 audio, max is 1.0
  const exponent = 2.0
  return Math.max(0, maxGain * Math.pow(sliderValue, exponent))
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Session state from Zustand
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

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const handleEnded = () => {
      const total = getTotalSlides()
      if (autoAdvance && currentSlide < total - 1) {
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1)
        }, 800)
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentSlide, autoAdvance, getTotalSlides, setCurrentSlide, setIsPlaying])

  // Update audio source when slide changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const audioUrl = audioUrls[currentSlide]
    if (audioUrl) {
      audio.src = audioUrl
      audio.playbackRate = playbackSpeed
      audio.muted = isMuted
      audio.volume = calculateVolume(volume)

      if (isPlaying) {
        audio.play().catch(console.error)
      }
    }
  }, [currentSlide, audioUrls, isPlaying, playbackSpeed, isMuted, volume])

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // Update muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = calculateVolume(volume)
    }
  }, [volume])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const audioUrl = audioUrls[currentSlide]
    if (audioUrl) {
      audio.src = audioUrl
      audio.playbackRate = playbackSpeed
      audio.muted = isMuted
      audio.volume = calculateVolume(volume)
      audio.play().catch(console.error)
    }
    setIsPlaying(true)
  }, [audioUrls, currentSlide, playbackSpeed, isMuted, volume, setIsPlaying])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [setIsPlaying])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }, [setIsPlaying])

  return {
    play,
    pause,
    stop,
    togglePlayPause,
    audioRef,
  }
}
