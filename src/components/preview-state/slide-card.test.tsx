import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlideCard } from './slide-card'
import { useNarratorStore } from '@/lib/store'
import type { PresentationData } from '@/lib/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}))

const mockPresentationData: PresentationData = {
  metadata: {
    title: 'Test Presentation',
    subtitle: 'A subtitle',
    titleScript: 'Welcome script',
  },
  slides: [
    {
      title: 'First Slide',
      points: ['Point 1', 'Point 2', 'Point 3'],
      script: 'First slide script',
    },
    {
      title: 'Second Slide',
      points: ['Point A'],
      script: 'Second slide script',
    },
  ],
}

describe('SlideCard', () => {
  beforeEach(() => {
    useNarratorStore.getState().reset()
    useNarratorStore.getState().setPresentationData(mockPresentationData)
  })

  describe('Title Slide', () => {
    it('renders title slide with metadata', () => {
      render(<SlideCard index={0} isTitle />)

      expect(screen.getByDisplayValue('Test Presentation')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A subtitle')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Welcome script')).toBeInTheDocument()
    })

    it('displays T badge for title slide', () => {
      render(<SlideCard index={0} isTitle />)

      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('does not show add bullet button on title slide', () => {
      render(<SlideCard index={0} isTitle />)

      expect(screen.queryByText('Add bullet')).not.toBeInTheDocument()
    })

    it('does not show remove slide button on title slide', () => {
      render(<SlideCard index={0} isTitle />)

      expect(screen.queryByLabelText('Remove slide')).not.toBeInTheDocument()
    })
  })

  describe('Content Slide', () => {
    it('renders content slide with data', () => {
      render(<SlideCard index={0} />)

      expect(screen.getByDisplayValue('First Slide')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Point 1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Point 2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Point 3')).toBeInTheDocument()
      expect(screen.getByDisplayValue('First slide script')).toBeInTheDocument()
    })

    it('displays slide number badge', () => {
      render(<SlideCard index={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows add bullet button', () => {
      render(<SlideCard index={0} />)

      expect(screen.getByText('Add bullet')).toBeInTheDocument()
    })
  })

  describe('Editing', () => {
    it('updates slide title when edited', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} />)

      const titleInput = screen.getByDisplayValue('First Slide')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].title).toBe('Updated Title')
    })

    it('updates bullet point when edited', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} />)

      const pointInput = screen.getByDisplayValue('Point 1')
      await user.clear(pointInput)
      await user.type(pointInput, 'New Point')

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].points[0]).toBe('New Point')
    })

    it('updates script when edited', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} />)

      const scriptTextarea = screen.getByDisplayValue('First slide script')
      await user.clear(scriptTextarea)
      await user.type(scriptTextarea, 'New script')

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].script).toBe('New script')
    })

    it('updates metadata title when editing title slide', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} isTitle />)

      const titleInput = screen.getByDisplayValue('Test Presentation')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.metadata.title).toBe('New Title')
    })
  })

  describe('Bullet Operations', () => {
    it('adds a bullet when clicking add button', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} />)

      const initialPoints = useNarratorStore.getState().presentationData?.slides[0].points.length

      await user.click(screen.getByText('Add bullet'))

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].points.length).toBe(initialPoints! + 1)
      expect(presentationData?.slides[0].points[initialPoints!]).toBe('New point')
    })

    it('shows remove bullet buttons when multiple bullets exist', () => {
      render(<SlideCard index={0} />)

      // Slide 0 has 3 bullets, so remove buttons should be visible on hover
      const removeButtons = screen.getAllByLabelText('Remove bullet point')
      expect(removeButtons).toHaveLength(3)
    })

    it('removes bullet when clicking remove button', async () => {
      const user = userEvent.setup()
      render(<SlideCard index={0} />)

      const removeButtons = screen.getAllByLabelText('Remove bullet point')
      await user.click(removeButtons[1]) // Remove second bullet

      const { presentationData } = useNarratorStore.getState()
      expect(presentationData?.slides[0].points).toEqual(['Point 1', 'Point 3'])
    })

    it('does not show remove button when only one bullet remains', () => {
      render(<SlideCard index={1} />) // Second slide has only 1 bullet

      expect(screen.queryByLabelText('Remove bullet point')).not.toBeInTheDocument()
    })
  })

  describe('Remove Slide', () => {
    it('shows remove button when onRemove is provided and canRemove is true', () => {
      const onRemove = vi.fn()
      render(<SlideCard index={0} onRemove={onRemove} canRemove={true} />)

      expect(screen.getByLabelText('Remove slide')).toBeInTheDocument()
    })

    it('hides remove button when canRemove is false', () => {
      const onRemove = vi.fn()
      render(<SlideCard index={0} onRemove={onRemove} canRemove={false} />)

      expect(screen.queryByLabelText('Remove slide')).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      render(<SlideCard index={0} onRemove={onRemove} canRemove={true} />)

      await user.click(screen.getByLabelText('Remove slide'))

      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('Drag Handle', () => {
    const mockDragProps = {
      attributes: {
        role: 'button',
        tabIndex: 0,
        'aria-disabled': false,
        'aria-pressed': undefined,
        'aria-roledescription': 'sortable',
        'aria-describedby': 'test-id',
      },
      listeners: undefined,
    } as const

    it('shows drag handle when dragHandleProps is provided', () => {
      render(<SlideCard index={0} dragHandleProps={mockDragProps} />)

      expect(screen.getByLabelText('Drag to reorder slide 1')).toBeInTheDocument()
    })

    it('does not show drag handle when dragHandleProps is not provided', () => {
      render(<SlideCard index={0} />)

      expect(screen.queryByLabelText(/Drag to reorder/)).not.toBeInTheDocument()
    })

    it('does not show drag handle on title slide', () => {
      render(<SlideCard index={0} isTitle dragHandleProps={mockDragProps} />)

      expect(screen.queryByLabelText(/Drag to reorder/)).not.toBeInTheDocument()
    })
  })

  describe('Dragging State', () => {
    it('applies dragging styles when isDragging is true', () => {
      const { container } = render(<SlideCard index={0} isDragging={true} />)

      // The card should have ring styles when dragging
      const card = container.querySelector('.ring-2')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('returns null when presentation data is null', () => {
      useNarratorStore.getState().setPresentationData(null)
      const { container } = render(<SlideCard index={0} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when slide does not exist', () => {
      const { container } = render(<SlideCard index={99} />)

      expect(container.firstChild).toBeNull()
    })
  })
})
