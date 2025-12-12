import type { Style, Voice } from './types'

export interface UserSettings {
  playback: {
    volume: number
    speed: number
    autoAdvance: boolean
  }
  defaults: {
    voice: Voice
    style: Style
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  playback: {
    volume: 0.6,
    speed: 1.2,
    autoAdvance: true,
  },
  defaults: {
    voice: 'nova',
    style: 'narrative',
  },
}

export const STORAGE_KEYS = {
  SETTINGS: 'narrator:settings',
  PRESENTATIONS: 'narrator-storage', // Keep existing key for backwards compat
} as const
