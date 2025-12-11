import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, NarratorExportFile, PresentationData, Style, Voice } from './types'
import { indexedDBStorage, migrateFromLocalStorage } from './indexed-db'

export interface SavedPresentation {
  id: string
  name: string
  savedAt: number // timestamp
  presentationData: PresentationData
  audioUrls: Record<number, string>
  style: Style
  voice: Voice
}

interface NarratorStore {
  // Navigation
  appState: AppState
  setAppState: (state: AppState) => void

  // Input state (session-specific, not persisted)
  content: string
  setContent: (content: string) => void
  style: Style
  setStyle: (style: Style) => void

  // Preview state (session-specific)
  voice: Voice
  setVoice: (voice: Voice) => void
  presentationData: PresentationData | null
  setPresentationData: (data: PresentationData | null) => void
  updateSlide: (index: number, slide: Partial<PresentationData['slides'][0]>) => void
  updateMetadata: (metadata: Partial<PresentationData['metadata']>) => void

  // Slide CRUD operations
  addSlide: (afterIndex: number) => void
  removeSlide: (index: number) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void

  // Bullet CRUD operations
  addBullet: (slideIndex: number) => void
  removeBullet: (slideIndex: number, bulletIndex: number) => void

  // Viewer state (session-specific)
  currentSlide: number
  setCurrentSlide: (slide: number) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  scriptPanelOpen: boolean
  setScriptPanelOpen: (open: boolean) => void
  audioUrls: Record<number, string>
  setAudioUrls: (urls: Record<number, string>) => void

  // Content hash tracking for dirty state detection
  lastGeneratedContentHash: string | null
  setLastGeneratedContentHash: (hash: string | null) => void
  getContentHash: () => string
  isContentDirty: () => boolean

  // Loading state
  isLoading: boolean
  loadingText: string
  loadingSubtext: string
  loadingProgress: number
  setLoading: (loading: boolean, text?: string, subtext?: string) => void
  setLoadingProgress: (progress: number) => void

  // Demo mode
  isDemoMode: boolean
  setDemoMode: (demo: boolean) => void

  // Saved presentations (persisted)
  savedPresentations: SavedPresentation[]
  saveCurrentPresentation: (name: string) => void
  loadPresentation: (id: string) => void
  deletePresentation: (id: string) => void
  importPresentation: (data: NarratorExportFile, mode: 'view' | 'edit') => void

  // Actions
  reset: () => void
  getTotalSlides: () => number
  getCurrentScript: () => string
}

const initialState = {
  appState: 'input' as AppState,
  content: '',
  style: 'narrative' as Style,
  voice: 'nova' as Voice,
  presentationData: null,
  currentSlide: 0,
  isPlaying: false,
  isMuted: false,
  scriptPanelOpen: false,
  audioUrls: {},
  isLoading: false,
  loadingText: '',
  loadingSubtext: '',
  loadingProgress: 0,
  isDemoMode: false,
  savedPresentations: [],
  lastGeneratedContentHash: null as string | null,
}

export const useNarratorStore = create<NarratorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAppState: (appState) => set({ appState }),
      setContent: (content) => set({ content }),
      setStyle: (style) => set({ style }),
      setVoice: (voice) => set({ voice }),
      setPresentationData: (presentationData) => set({ presentationData }),

      updateSlide: (index, slideUpdate) =>
        set((state) => {
          if (!state.presentationData) return state
          const slides = [...state.presentationData.slides]
          slides[index] = { ...slides[index], ...slideUpdate }
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      updateMetadata: (metadataUpdate) =>
        set((state) => {
          if (!state.presentationData) return state
          return {
            presentationData: {
              ...state.presentationData,
              metadata: { ...state.presentationData.metadata, ...metadataUpdate },
            },
          }
        }),

      // Slide CRUD operations
      addSlide: (afterIndex) =>
        set((state) => {
          if (!state.presentationData) return state
          const newSlide = {
            title: 'New Slide',
            points: ['Add your first point'],
            script: 'Add your speaker notes here.',
          }
          const slides = [...state.presentationData.slides]
          slides.splice(afterIndex + 1, 0, newSlide)
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      removeSlide: (index) =>
        set((state) => {
          if (!state.presentationData) return state
          if (state.presentationData.slides.length <= 1) return state // Keep at least one slide
          const slides = state.presentationData.slides.filter((_, i) => i !== index)
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      reorderSlides: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.presentationData) return state
          const slides = [...state.presentationData.slides]
          const [removed] = slides.splice(fromIndex, 1)
          slides.splice(toIndex, 0, removed)
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      // Bullet CRUD operations
      addBullet: (slideIndex) =>
        set((state) => {
          if (!state.presentationData) return state
          const slides = [...state.presentationData.slides]
          slides[slideIndex] = {
            ...slides[slideIndex],
            points: [...slides[slideIndex].points, 'New point'],
          }
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      removeBullet: (slideIndex, bulletIndex) =>
        set((state) => {
          if (!state.presentationData) return state
          const slides = [...state.presentationData.slides]
          if (slides[slideIndex].points.length <= 1) return state // Keep at least one bullet
          slides[slideIndex] = {
            ...slides[slideIndex],
            points: slides[slideIndex].points.filter((_, i) => i !== bulletIndex),
          }
          return {
            presentationData: { ...state.presentationData, slides },
          }
        }),

      setCurrentSlide: (currentSlide) => set({ currentSlide }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setIsMuted: (isMuted) => set({ isMuted }),
      setScriptPanelOpen: (scriptPanelOpen) => set({ scriptPanelOpen }),
      setAudioUrls: (audioUrls) => set({ audioUrls }),

      // Content hash tracking
      setLastGeneratedContentHash: (lastGeneratedContentHash) => set({ lastGeneratedContentHash }),

      getContentHash: () => {
        const { presentationData, voice } = get()
        if (!presentationData) return ''
        // Create a deterministic hash from presentation content and voice
        const content = JSON.stringify({
          metadata: presentationData.metadata,
          slides: presentationData.slides,
          voice,
        })
        // Simple hash function
        let hash = 0
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        return hash.toString(36)
      },

      isContentDirty: () => {
        const { lastGeneratedContentHash, getContentHash, audioUrls } = get()
        // If no audio has been generated yet, content is "dirty"
        if (!lastGeneratedContentHash || Object.keys(audioUrls).length === 0) return true
        return getContentHash() !== lastGeneratedContentHash
      },

      setLoading: (isLoading, loadingText = '', loadingSubtext = '') =>
        set({ isLoading, loadingText, loadingSubtext, loadingProgress: 0 }),

      setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

      setDemoMode: (isDemoMode) => set({ isDemoMode }),

      // Saved presentations
      saveCurrentPresentation: (name: string) => {
        const { presentationData, audioUrls, style, voice, savedPresentations } = get()
        if (!presentationData) return

        const newPresentation: SavedPresentation = {
          id: `pres_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name,
          savedAt: Date.now(),
          presentationData,
          audioUrls,
          style,
          voice,
        }

        set({
          savedPresentations: [...savedPresentations, newPresentation],
        })
      },

      loadPresentation: (id: string) => {
        const { savedPresentations, getContentHash } = get()
        const presentation = savedPresentations.find((p) => p.id === id)
        if (!presentation) return

        // Set the presentation data first
        set({
          presentationData: presentation.presentationData,
          audioUrls: presentation.audioUrls,
          style: presentation.style,
          voice: presentation.voice,
          appState: 'preview',
          currentSlide: 0,
        })

        // Calculate and set the content hash if audio exists
        if (Object.keys(presentation.audioUrls).length > 0) {
          const hash = getContentHash()
          set({ lastGeneratedContentHash: hash })
        }
      },

      deletePresentation: (id: string) => {
        const { savedPresentations } = get()
        set({
          savedPresentations: savedPresentations.filter((p) => p.id !== id),
        })
      },

      importPresentation: (data: NarratorExportFile, mode: 'view' | 'edit') => {
        const { savedPresentations, getContentHash } = get()

        // Create a new saved presentation from the import data
        const newPresentation: SavedPresentation = {
          id: `pres_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          savedAt: Date.now(),
          presentationData: data.presentationData,
          audioUrls: data.audioUrls,
          style: data.style,
          voice: data.voice,
        }

        // Save to library and set as current
        set({
          savedPresentations: [...savedPresentations, newPresentation],
          presentationData: data.presentationData,
          audioUrls: data.audioUrls,
          style: data.style,
          voice: data.voice,
          currentSlide: 0,
          appState: mode === 'view' ? 'viewer' : 'preview',
        })

        // Calculate and set the content hash if audio exists
        if (Object.keys(data.audioUrls).length > 0) {
          const hash = getContentHash()
          set({ lastGeneratedContentHash: hash })
        }
      },

      reset: () => set(initialState),

      getTotalSlides: () => {
        const { presentationData } = get()
        return presentationData ? presentationData.slides.length + 1 : 0
      },

      getCurrentScript: () => {
        const { presentationData, currentSlide } = get()
        if (!presentationData) return ''
        if (currentSlide === 0) {
          return presentationData.metadata.titleScript
        }
        return presentationData.slides[currentSlide - 1]?.script || ''
      },
    }),
    {
      name: 'narrator-storage',
      storage: indexedDBStorage,
      partialize: (state) => ({
        savedPresentations: state.savedPresentations,
      }),
    }
  )
)

// Run migration from localStorage on app start (browser only)
if (typeof window !== 'undefined') {
  migrateFromLocalStorage().catch(console.error)
}
