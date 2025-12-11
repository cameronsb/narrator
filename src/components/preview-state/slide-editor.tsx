'use client'

import { useNarratorStore } from '@/lib/store'
import { SlideCard } from './slide-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'

export function SlideEditor() {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const addSlide = useNarratorStore((s) => s.addSlide)
  const removeSlide = useNarratorStore((s) => s.removeSlide)
  const reorderSlides = useNarratorStore((s) => s.reorderSlides)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate stable IDs for slides
  const slideIds = useMemo(
    () => presentationData?.slides.map((_, i) => `slide-${i}`) ?? [],
    [presentationData?.slides.length]
  )

  if (!presentationData) return null

  const canRemoveSlides = presentationData.slides.length > 1

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = slideIds.indexOf(active.id as string)
      const newIndex = slideIds.indexOf(over.id as string)
      reorderSlides(oldIndex, newIndex)
    }
  }

  return (
    <div className="space-y-3">
      {/* Title slide (not draggable) */}
      <SlideCard index={0} isTitle />

      {/* Add slide after title */}
      <AddSlideButton onClick={() => addSlide(-1)} label="Add slide after title" />

      {/* Sortable content slides */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
          {presentationData.slides.map((_, index) => (
            <SortableSlide
              key={slideIds[index]}
              id={slideIds[index]}
              index={index}
              onRemove={() => removeSlide(index)}
              canRemove={canRemoveSlides}
              onAddSlide={() => addSlide(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortableSlideProps {
  id: string
  index: number
  onRemove: () => void
  canRemove: boolean
  onAddSlide: () => void
}

function SortableSlide({ id, index, onRemove, canRemove, onAddSlide }: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <SlideCard
        index={index}
        onRemove={onRemove}
        canRemove={canRemove}
        dragHandleProps={{ attributes, listeners }}
        isDragging={isDragging}
      />
      <AddSlideButton onClick={onAddSlide} label={`Add slide after slide ${index + 1}`} />
    </div>
  )
}

function AddSlideButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="flex justify-center py-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="h-7 gap-1.5 rounded-full border-white/30 bg-white/10 px-3 text-xs text-white/70 transition-all hover:border-white/50 hover:bg-white/20 hover:text-white"
        aria-label={label}
      >
        <Plus className="h-3.5 w-3.5" />
        Add slide
      </Button>
    </div>
  )
}
