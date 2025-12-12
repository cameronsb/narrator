'use client'

import { useLocalStorage } from './use-local-storage'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../settings'
import type { UserSettings } from '../settings'
import { useEffect } from 'react'

function mergeWithDefaults(stored: Partial<UserSettings>): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    playback: {
      ...DEFAULT_SETTINGS.playback,
      ...(stored.playback || {}),
    },
  }
}

export function useSettings() {
  const [storedSettings, setStoredSettings] = useLocalStorage<UserSettings>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS
  )

  const settings = mergeWithDefaults(storedSettings as Partial<UserSettings>)

  // Sync merged settings back if they differ (handles new default fields)
  useEffect(() => {
    if (JSON.stringify(storedSettings) !== JSON.stringify(settings)) {
      setStoredSettings(settings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSettings = (value: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setStoredSettings(value)
  }

  // Playback settings
  const setVolume = (volume: number) => {
    setSettings((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        volume: Math.max(0, Math.min(1, volume)),
      },
    }))
  }

  const setSpeed = (speed: number) => {
    setSettings((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        speed: Math.max(0.5, Math.min(2.5, speed)),
      },
    }))
  }

  const setAutoAdvance = (autoAdvance: boolean) => {
    setSettings((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        autoAdvance,
      },
    }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    setSettings,
    setVolume,
    setSpeed,
    setAutoAdvance,
    resetSettings,
  }
}
