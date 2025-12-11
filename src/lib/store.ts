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
  isDraft?: boolean // true = auto-saved working session, not explicitly saved
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

  // Active session tracking (persisted)
  activePresentationId: string | null
  setActivePresentationId: (id: string | null) => void
  saveAsDraft: () => string | null // Returns the draft ID or null if no data
  clearActiveSession: () => void
  tryRecoverSession: () => boolean // Returns true if session was recovered

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
  presentationData: null as PresentationData | null,
  currentSlide: 0,
  isPlaying: false,
  isMuted: false,
  scriptPanelOpen: false,
  audioUrls: {} as Record<number, string>,
  isLoading: false,
  loadingText: '',
  loadingSubtext: '',
  loadingProgress: 0,
  isDemoMode: false,
  savedPresentations: [] as SavedPresentation[],
  lastGeneratedContentHash: null as string | null,
  activePresentationId: null as string | null,
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

      // Active session tracking
      setActivePresentationId: (activePresentationId) => set({ activePresentationId }),

      saveAsDraft: () => {
        const { presentationData, audioUrls, style, voice, savedPresentations, activePresentationId } =
          get()
        if (!presentationData) return null

        // Check if we're updating an existing draft
        const existingDraft = activePresentationId
          ? savedPresentations.find((p) => p.id === activePresentationId)
          : null

        if (existingDraft) {
          // Update existing draft
          const updatedPresentations = savedPresentations.map((p) =>
            p.id === activePresentationId
              ? {
                  ...p,
                  savedAt: Date.now(),
                  presentationData,
                  audioUrls,
                  style,
                  voice,
                }
              : p
          )
          set({ savedPresentations: updatedPresentations })
          return activePresentationId
        }

        // Create new draft
        const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const draftName = presentationData.metadata.title || 'Untitled Draft'
        const newDraft: SavedPresentation = {
          id: draftId,
          name: draftName,
          savedAt: Date.now(),
          presentationData,
          audioUrls,
          style,
          voice,
          isDraft: true,
        }

        set({
          savedPresentations: [...savedPresentations, newDraft],
          activePresentationId: draftId,
        })
        return draftId
      },

      clearActiveSession: () => {
        set({
          activePresentationId: null,
          presentationData: null,
          audioUrls: {},
          currentSlide: 0,
          lastGeneratedContentHash: null,
        })
      },

      tryRecoverSession: () => {
        const { activePresentationId, savedPresentations, presentationData, getContentHash } = get()

        // Already have data in memory, no recovery needed
        if (presentationData) return true

        // No active session to recover
        if (!activePresentationId) return false

        // Try to find the presentation
        const presentation = savedPresentations.find((p) => p.id === activePresentationId)
        if (!presentation) {
          // Active ID exists but presentation was deleted - clean up
          set({ activePresentationId: null })
          return false
        }

        // Recover the session
        set({
          presentationData: presentation.presentationData,
          audioUrls: presentation.audioUrls,
          style: presentation.style,
          voice: presentation.voice,
          currentSlide: 0,
        })

        // Set content hash if audio exists
        if (Object.keys(presentation.audioUrls).length > 0) {
          const hash = getContentHash()
          set({ lastGeneratedContentHash: hash })
        }

        return true
      },

      // Saved presentations
      saveCurrentPresentation: (name: string) => {
        const { presentationData, audioUrls, style, voice, savedPresentations, activePresentationId } =
          get()
        if (!presentationData) return

        // Check if we're updating an existing presentation (draft or not)
        const existingPresentation = activePresentationId
          ? savedPresentations.find((p) => p.id === activePresentationId)
          : null

        if (existingPresentation) {
          // Update existing presentation, convert draft to saved (remove isDraft flag)
          const updatedPresentations = savedPresentations.map((p) =>
            p.id === activePresentationId
              ? {
                  ...p,
                  name,
                  savedAt: Date.now(),
                  presentationData,
                  audioUrls,
                  style,
                  voice,
                  isDraft: undefined, // Clear draft flag - this is now explicitly saved
                }
              : p
          )
          set({ savedPresentations: updatedPresentations })
          return
        }

        // Create new presentation
        const newId = `pres_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const newPresentation: SavedPresentation = {
          id: newId,
          name,
          savedAt: Date.now(),
          presentationData,
          audioUrls,
          style,
          voice,
        }

        set({
          savedPresentations: [...savedPresentations, newPresentation],
          activePresentationId: newId,
        })
      },

      loadPresentation: (id: string) => {
        const { savedPresentations, getContentHash } = get()
        const presentation = savedPresentations.find((p) => p.id === id)
        if (!presentation) return

        // Set the presentation data and mark this as the active session
        set({
          presentationData: presentation.presentationData,
          audioUrls: presentation.audioUrls,
          style: presentation.style,
          voice: presentation.voice,
          appState: 'preview',
          currentSlide: 0,
          activePresentationId: id,
        })

        // Calculate and set the content hash if audio exists
        if (Object.keys(presentation.audioUrls).length > 0) {
          const hash = getContentHash()
          set({ lastGeneratedContentHash: hash })
        }
      },

      deletePresentation: (id: string) => {
        const { savedPresentations, activePresentationId } = get()
        const updates: Partial<NarratorStore> = {
          savedPresentations: savedPresentations.filter((p) => p.id !== id),
        }
        // Clear active session if we're deleting the active presentation
        if (activePresentationId === id) {
          updates.activePresentationId = null
        }
        set(updates as NarratorStore)
      },

      importPresentation: (data: NarratorExportFile, mode: 'view' | 'edit') => {
        const { savedPresentations, getContentHash } = get()

        // Create a new saved presentation from the import data
        const newId = `pres_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const newPresentation: SavedPresentation = {
          id: newId,
          name: data.name,
          savedAt: Date.now(),
          presentationData: data.presentationData,
          audioUrls: data.audioUrls,
          style: data.style,
          voice: data.voice,
        }

        // Save to library, set as current, and mark as active session
        set({
          savedPresentations: [...savedPresentations, newPresentation],
          presentationData: data.presentationData,
          audioUrls: data.audioUrls,
          style: data.style,
          voice: data.voice,
          currentSlide: 0,
          appState: mode === 'view' ? 'viewer' : 'preview',
          activePresentationId: newId,
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
        activePresentationId: state.activePresentationId,
      }),
    }
  )
)

/**
 * Subscribe to hydration completion. Calls the callback when hydration is done.
 * If already hydrated, calls the callback immediately.
 * Returns an unsubscribe function.
 */
export function onHydrated(callback: () => void): () => void {
  if (useNarratorStore.persist.hasHydrated()) {
    callback()
    return () => {} // No-op unsubscribe
  }

  return useNarratorStore.persist.onFinishHydration(callback)
}

// Run migration from localStorage on app start (browser only)
if (typeof window !== 'undefined') {
  migrateFromLocalStorage().catch(console.error)
}
