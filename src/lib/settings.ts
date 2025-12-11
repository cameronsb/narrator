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
    volume: 0.5, // Softer default (exponential scaling: 0.5^2 = 0.25 actual)
    speed: 1.2,
    autoAdvance: false, // Default to manual control; less surprising for first-time users
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
