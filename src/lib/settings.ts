export interface UserSettings {
  playback: {
    volume: number
    speed: number
    autoAdvance: boolean
  }
  captions: {
    enabled: boolean
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  playback: {
    volume: 0.6,
    speed: 1.2,
    autoAdvance: true,
  },
  captions: {
    enabled: true,
  },
}

export const STORAGE_KEYS = {
  SETTINGS: 'narrator:settings',
} as const
