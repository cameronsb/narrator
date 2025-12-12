import { describe, it, expect, beforeEach } from 'vitest'
import { useNarratorStore } from './store'
import type { PresentationData } from './types'

const mockPresentationData: PresentationData = {
  metadata: {
    title: 'Test Presentation',
    subtitle: 'A test subtitle',
    titleScript: 'Welcome to the test presentation.',
  },
  slides: [
    {
      title: 'Slide 1',
      points: ['Point 1', 'Point 2', 'Point 3'],
      script: 'This is the first slide.',
    },
    {
      title: 'Slide 2',
      points: ['Point A', 'Point B'],
      script: 'This is the second slide.',
    },
    {
      title: 'Slide 3',
      points: ['Final point'],
      script: 'This is the third slide.',
    },
  ],
}

describe('NarratorStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useNarratorStore.getState().reset()
  })

  describe('Navigation', () => {
    it('should initialize with input state', () => {
      const { appState } = useNarratorStore.getState()
      expect(appState).toBe('input')
    })

    it('should update app state', () => {
      useNarratorStore.getState().setAppState('preview')
      expect(useNarratorStore.getState().appState).toBe('preview')

      useNarratorStore.getState().setAppState('viewer')
      expect(useNarratorStore.getState().appState).toBe('viewer')
    })
  })

  describe('Content Management', () => {
    it('should update content', () => {
      useNarratorStore.getState().setContent('New content')
      expect(useNarratorStore.getState().content).toBe('New content')
    })

    it('should update style', () => {
      useNarratorStore.getState().setStyle('informative')
      expect(useNarratorStore.getState().style).toBe('informative')
    })

    it('should update voice', () => {
      useNarratorStore.getState().setVoice('echo')
      expect(useNarratorStore.getState().voice).toBe('echo')
    })
  })

  describe('Presentation Data', () => {
    it('should set presentation data', () => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData).toEqual(mockPresentationData)
    })

    it('should clear presentation data', () => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      useNarratorStore.getState().setPresentationData(null)
      expect(useNarratorStore.getState().presentationData).toBeNull()
    })
  })

  describe('Slide Updates', () => {
    beforeEach(() => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
    })

    it('should update slide title', () => {
      useNarratorStore.getState().updateSlide(0, { title: 'Updated Title' })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].title).toBe('Updated Title')
    })

    it('should update slide points', () => {
      const newPoints = ['New Point 1', 'New Point 2']
      useNarratorStore.getState().updateSlide(1, { points: newPoints })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[1].points).toEqual(newPoints)
    })

    it('should update slide script', () => {
      useNarratorStore.getState().updateSlide(2, { script: 'New script' })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[2].script).toBe('New script')
    })

    it('should not update if presentation data is null', () => {
      useNarratorStore.getState().setPresentationData(null)
      useNarratorStore.getState().updateSlide(0, { title: 'Should not work' })
      expect(useNarratorStore.getState().presentationData).toBeNull()
    })
  })

  describe('Metadata Updates', () => {
    beforeEach(() => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
    })

    it('should update metadata title', () => {
      useNarratorStore.getState().updateMetadata({ title: 'New Title' })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.metadata.title).toBe('New Title')
    })

    it('should update metadata subtitle', () => {
      useNarratorStore.getState().updateMetadata({ subtitle: 'New Subtitle' })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.metadata.subtitle).toBe('New Subtitle')
    })

    it('should update title script', () => {
      useNarratorStore.getState().updateMetadata({ titleScript: 'New script' })
      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.metadata.titleScript).toBe('New script')
    })
  })

  describe('Slide CRUD Operations', () => {
    beforeEach(() => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
    })

    describe('addSlide', () => {
      it('should add a slide after the specified index', () => {
        useNarratorStore.getState().addSlide(0)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides).toHaveLength(4)
        expect(presentationData?.slides[1].title).toBe('New Slide')
      })

      it('should add a slide at the beginning when index is -1', () => {
        useNarratorStore.getState().addSlide(-1)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides).toHaveLength(4)
        expect(presentationData?.slides[0].title).toBe('New Slide')
      })

      it('should add slide with default content', () => {
        useNarratorStore.getState().addSlide(0)
        const { presentationData } = useNarratorStore.getState()
        const newSlide = presentationData?.slides[1]
        expect(newSlide?.title).toBe('New Slide')
        expect(newSlide?.points).toEqual(['Add your first point'])
        expect(newSlide?.script).toBe('Add your speaker notes here.')
      })

      it('should not add slide if presentation data is null', () => {
        useNarratorStore.getState().setPresentationData(null)
        useNarratorStore.getState().addSlide(0)
        expect(useNarratorStore.getState().presentationData).toBeNull()
      })
    })

    describe('removeSlide', () => {
      it('should remove a slide at the specified index', () => {
        useNarratorStore.getState().removeSlide(1)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides).toHaveLength(2)
        expect(presentationData?.slides[1].title).toBe('Slide 3')
      })

      it('should not remove the last remaining slide', () => {
        // Remove slides until only one remains
        useNarratorStore.getState().removeSlide(0)
        useNarratorStore.getState().removeSlide(0)
        expect(useNarratorStore.getState().presentationData?.slides).toHaveLength(1)

        // Try to remove the last slide
        useNarratorStore.getState().removeSlide(0)
        expect(useNarratorStore.getState().presentationData?.slides).toHaveLength(1)
      })

      it('should not remove slide if presentation data is null', () => {
        useNarratorStore.getState().setPresentationData(null)
        useNarratorStore.getState().removeSlide(0)
        expect(useNarratorStore.getState().presentationData).toBeNull()
      })
    })

    describe('reorderSlides', () => {
      it('should move a slide from one position to another', () => {
        useNarratorStore.getState().reorderSlides(0, 2)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].title).toBe('Slide 2')
        expect(presentationData?.slides[1].title).toBe('Slide 3')
        expect(presentationData?.slides[2].title).toBe('Slide 1')
      })

      it('should handle moving slide to earlier position', () => {
        useNarratorStore.getState().reorderSlides(2, 0)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].title).toBe('Slide 3')
        expect(presentationData?.slides[1].title).toBe('Slide 1')
        expect(presentationData?.slides[2].title).toBe('Slide 2')
      })
    })
  })

  describe('Bullet CRUD Operations', () => {
    beforeEach(() => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
    })

    describe('addBullet', () => {
      it('should add a bullet to the specified slide', () => {
        const initialLength = mockPresentationData.slides[0].points.length
        useNarratorStore.getState().addBullet(0)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].points).toHaveLength(initialLength + 1)
        expect(presentationData?.slides[0].points[initialLength]).toBe('New point')
      })

      it('should not add bullet if presentation data is null', () => {
        useNarratorStore.getState().setPresentationData(null)
        useNarratorStore.getState().addBullet(0)
        expect(useNarratorStore.getState().presentationData).toBeNull()
      })
    })

    describe('removeBullet', () => {
      it('should remove a bullet from the specified slide', () => {
        useNarratorStore.getState().removeBullet(0, 1)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].points).toHaveLength(2)
        expect(presentationData?.slides[0].points).toEqual(['Point 1', 'Point 3'])
      })

      it('should not remove the last remaining bullet', () => {
        // Slide 3 only has one bullet
        useNarratorStore.getState().removeBullet(2, 0)
        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[2].points).toHaveLength(1)
      })

      it('should not remove bullet if presentation data is null', () => {
        useNarratorStore.getState().setPresentationData(null)
        useNarratorStore.getState().removeBullet(0, 0)
        expect(useNarratorStore.getState().presentationData).toBeNull()
      })
    })
  })

  describe('Viewer State', () => {
    it('should update current slide', () => {
      useNarratorStore.getState().setCurrentSlide(3)
      expect(useNarratorStore.getState().currentSlide).toBe(3)
    })

    it('should update playing state', () => {
      useNarratorStore.getState().setIsPlaying(true)
      expect(useNarratorStore.getState().isPlaying).toBe(true)
    })

    it('should update muted state', () => {
      useNarratorStore.getState().setIsMuted(true)
      expect(useNarratorStore.getState().isMuted).toBe(true)
    })

    it('should update script panel state', () => {
      useNarratorStore.getState().setScriptPanelOpen(true)
      expect(useNarratorStore.getState().scriptPanelOpen).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should set loading state with text', () => {
      useNarratorStore.getState().setLoading(true, 'Loading...', 'Please wait')
      const state = useNarratorStore.getState()
      expect(state.isLoading).toBe(true)
      expect(state.loadingText).toBe('Loading...')
      expect(state.loadingSubtext).toBe('Please wait')
    })

    it('should clear loading state', () => {
      useNarratorStore.getState().setLoading(true, 'Loading...')
      useNarratorStore.getState().setLoading(false)
      const state = useNarratorStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.loadingText).toBe('')
    })

    it('should update loading progress', () => {
      useNarratorStore.getState().setLoadingProgress(50)
      expect(useNarratorStore.getState().loadingProgress).toBe(50)
    })
  })

  describe('Helper Functions', () => {
    it('should return total slides count including title', () => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      expect(useNarratorStore.getState().getTotalSlides()).toBe(4) // 3 slides + 1 title
    })

    it('should return 0 if no presentation data', () => {
      expect(useNarratorStore.getState().getTotalSlides()).toBe(0)
    })

    it('should return title script for slide 0', () => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      useNarratorStore.getState().setCurrentSlide(0)
      expect(useNarratorStore.getState().getCurrentScript()).toBe(
        'Welcome to the test presentation.'
      )
    })

    it('should return slide script for content slides', () => {
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      useNarratorStore.getState().setCurrentSlide(1)
      expect(useNarratorStore.getState().getCurrentScript()).toBe('This is the first slide.')
    })
  })

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      // Modify state
      useNarratorStore.getState().setContent('Modified content')
      useNarratorStore.getState().setAppState('viewer')
      useNarratorStore.getState().setPresentationData(mockPresentationData)
      useNarratorStore.getState().setCurrentSlide(5)

      // Reset
      useNarratorStore.getState().reset()

      // Verify reset
      const state = useNarratorStore.getState()
      expect(state.content).toBe('')
      expect(state.appState).toBe('input')
      expect(state.presentationData).toBeNull()
      expect(state.currentSlide).toBe(0)
    })
  })

  describe('History (Undo/Redo)', () => {
    beforeEach(() => {
      useNarratorStore.setState({
        presentationData: null,
        history: { past: [], future: [] },
      })
    })

    describe('pushHistory', () => {
      it('should add current state to past', () => {
        useNarratorStore.setState({ presentationData: mockPresentationData })
        useNarratorStore.getState().pushHistory()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(1)
        expect(history.past[0]).toEqual(mockPresentationData)
      })

      it('should clear future on new changes', () => {
        useNarratorStore.setState({
          presentationData: mockPresentationData,
          history: { past: [], future: [mockPresentationData] },
        })

        useNarratorStore.getState().pushHistory()

        const { history } = useNarratorStore.getState()
        expect(history.future).toHaveLength(0)
      })

      it('should limit history to 50 entries', () => {
        useNarratorStore.setState({ presentationData: mockPresentationData })

        // Push 60 entries
        for (let i = 0; i < 60; i++) {
          useNarratorStore.getState().pushHistory()
        }

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(50)
      })

      it('should not push if presentationData is null', () => {
        useNarratorStore.setState({ presentationData: null })
        useNarratorStore.getState().pushHistory()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(0)
      })

      it('should deep clone state (not reference)', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })
        useNarratorStore.getState().pushHistory()

        // Modify the current state
        useNarratorStore.getState().updateSlide(0, { title: 'Modified Title' })

        const { history } = useNarratorStore.getState()
        expect(history.past[0].slides[0].title).toBe('Slide 1')
      })
    })

    describe('undo', () => {
      it('should restore previous state', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Modified' })
        useNarratorStore.getState().undo()

        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].title).toBe('Slide 1')
      })

      it('should move current state to future', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Modified' })
        useNarratorStore.getState().undo()

        const { history } = useNarratorStore.getState()
        expect(history.future).toHaveLength(1)
        expect(history.future[0].slides[0].title).toBe('Modified')
      })

      it('should do nothing if past is empty', () => {
        useNarratorStore.setState({
          presentationData: mockPresentationData,
          history: { past: [], future: [] },
        })
        useNarratorStore.getState().undo()

        const { presentationData, history } = useNarratorStore.getState()
        expect(presentationData).toEqual(mockPresentationData)
        expect(history.past).toHaveLength(0)
      })

      it('should do nothing if presentationData is null', () => {
        useNarratorStore.setState({
          presentationData: null,
          history: { past: [mockPresentationData], future: [] },
        })
        useNarratorStore.getState().undo()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(1)
      })
    })

    describe('redo', () => {
      it('should restore next state from future', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Modified' })
        useNarratorStore.getState().undo()
        useNarratorStore.getState().redo()

        const { presentationData } = useNarratorStore.getState()
        expect(presentationData?.slides[0].title).toBe('Modified')
      })

      it('should move current state to past', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Modified' })
        useNarratorStore.getState().undo()
        useNarratorStore.getState().redo()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(1)
        expect(history.future).toHaveLength(0)
      })

      it('should do nothing if future is empty', () => {
        useNarratorStore.setState({
          presentationData: mockPresentationData,
          history: { past: [mockPresentationData], future: [] },
        })
        useNarratorStore.getState().redo()

        const { history } = useNarratorStore.getState()
        expect(history.future).toHaveLength(0)
      })
    })

    describe('clearHistory', () => {
      it('should clear both past and future', () => {
        useNarratorStore.setState({
          presentationData: mockPresentationData,
          history: {
            past: [mockPresentationData, mockPresentationData],
            future: [mockPresentationData],
          },
        })

        useNarratorStore.getState().clearHistory()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(0)
        expect(history.future).toHaveLength(0)
      })
    })

    describe('canUndo / canRedo', () => {
      it('canUndo should return true when past has entries', () => {
        useNarratorStore.setState({
          history: { past: [mockPresentationData], future: [] },
        })

        expect(useNarratorStore.getState().canUndo()).toBe(true)
      })

      it('canUndo should return false when past is empty', () => {
        useNarratorStore.setState({
          history: { past: [], future: [] },
        })

        expect(useNarratorStore.getState().canUndo()).toBe(false)
      })

      it('canRedo should return true when future has entries', () => {
        useNarratorStore.setState({
          history: { past: [], future: [mockPresentationData] },
        })

        expect(useNarratorStore.getState().canRedo()).toBe(true)
      })

      it('canRedo should return false when future is empty', () => {
        useNarratorStore.setState({
          history: { past: [], future: [] },
        })

        expect(useNarratorStore.getState().canRedo()).toBe(false)
      })
    })

    describe('history cleared on navigation', () => {
      it('setPresentationData should clear history', () => {
        useNarratorStore.setState({
          history: { past: [mockPresentationData], future: [mockPresentationData] },
        })

        useNarratorStore.getState().setPresentationData(mockPresentationData)

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(0)
        expect(history.future).toHaveLength(0)
      })

      it('loadPresentation should clear history', () => {
        useNarratorStore.setState({
          savedPresentations: [
            {
              id: 'test-id',
              name: 'Test',
              savedAt: Date.now(),
              presentationData: mockPresentationData,
              audioUrls: {},
              style: 'narrative',
              voice: 'nova',
            },
          ],
          history: { past: [mockPresentationData], future: [mockPresentationData] },
        })

        useNarratorStore.getState().loadPresentation('test-id')

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(0)
        expect(history.future).toHaveLength(0)
      })

      it('clearActiveSession should clear history', () => {
        useNarratorStore.setState({
          presentationData: mockPresentationData,
          history: { past: [mockPresentationData], future: [mockPresentationData] },
        })

        useNarratorStore.getState().clearActiveSession()

        const { history } = useNarratorStore.getState()
        expect(history.past).toHaveLength(0)
        expect(history.future).toHaveLength(0)
      })
    })

    describe('multiple undo/redo cycles', () => {
      it('should handle multiple undo/redo operations', () => {
        useNarratorStore.setState({ presentationData: structuredClone(mockPresentationData) })

        // Make 3 changes
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Change 1' })

        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Change 2' })

        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'Change 3' })

        // Verify current state
        expect(useNarratorStore.getState().presentationData?.slides[0].title).toBe('Change 3')

        // Undo twice
        useNarratorStore.getState().undo()
        expect(useNarratorStore.getState().presentationData?.slides[0].title).toBe('Change 2')

        useNarratorStore.getState().undo()
        expect(useNarratorStore.getState().presentationData?.slides[0].title).toBe('Change 1')

        // Redo once
        useNarratorStore.getState().redo()
        expect(useNarratorStore.getState().presentationData?.slides[0].title).toBe('Change 2')

        // Make a new change (should clear future)
        useNarratorStore.getState().pushHistory()
        useNarratorStore.getState().updateSlide(0, { title: 'New Branch' })

        expect(useNarratorStore.getState().history.future).toHaveLength(0)
        expect(useNarratorStore.getState().presentationData?.slides[0].title).toBe('New Branch')
      })
    })
  })
})
