'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useNarratorStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Plus, X, Trash2, GripVertical } from 'lucide-react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface SlideCardProps {
  index: number
  isTitle?: boolean
  onRemove?: () => void
  canRemove?: boolean
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: SyntheticListenerMap | undefined
  }
  isDragging?: boolean
}

export function SlideCard({
  index,
  isTitle = false,
  onRemove,
  canRemove = true,
  dragHandleProps,
  isDragging = false,
}: SlideCardProps) {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const updateSlide = useNarratorStore((s) => s.updateSlide)
  const updateMetadata = useNarratorStore((s) => s.updateMetadata)
  const addBullet = useNarratorStore((s) => s.addBullet)
  const removeBullet = useNarratorStore((s) => s.removeBullet)
  const pushHistory = useNarratorStore((s) => s.pushHistory)

  // Snapshot state before editing starts (on focus)
  // This groups all edits during an editing session into a single undo step
  const handleFocus = useCallback(() => {
    pushHistory()
  }, [pushHistory])

  if (!presentationData) return null

  // For title slide (index 0), use metadata
  const slide = isTitle
    ? {
        title: presentationData.metadata.title,
        points: presentationData.metadata.subtitle ? [presentationData.metadata.subtitle] : [],
        script: presentationData.metadata.titleScript,
      }
    : presentationData.slides[index]

  if (!slide) return null

  const handleTitleChange = (value: string) => {
    if (isTitle) {
      updateMetadata({ title: value })
    } else {
      updateSlide(index, { title: value })
    }
  }

  const handlePointChange = (pointIndex: number, value: string) => {
    if (isTitle) {
      updateMetadata({ subtitle: value })
    } else {
      const newPoints = [...slide.points]
      newPoints[pointIndex] = value
      updateSlide(index, { points: newPoints })
    }
  }

  const handleScriptChange = (value: string) => {
    if (isTitle) {
      updateMetadata({ titleScript: value })
    } else {
      updateSlide(index, { script: value })
    }
  }

  const canRemoveBullet = slide.points.length > 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card
        className={`shadow-lg transition-shadow ${isDragging ? 'ring-brand-400 shadow-xl ring-2' : ''}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {/* Drag handle (only for content slides) */}
            {!isTitle && dragHandleProps && (
              <button
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="text-muted-foreground hover:text-foreground -ml-1 cursor-grab touch-none rounded p-1 transition-colors active:cursor-grabbing"
                aria-label={`Drag to reorder slide ${index + 1}`}
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <div className="bg-brand-500 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
              {isTitle ? 'T' : index + 1}
            </div>
            <Input
              value={slide.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onFocus={handleFocus}
              className="focus-visible:border-primary flex-1 rounded-none border-0 border-b-2 border-transparent px-0 text-xl font-semibold focus-visible:ring-0"
              placeholder="Slide title"
            />
            {!isTitle && onRemove && canRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                aria-label="Remove slide"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bullet points */}
          <div className="space-y-2">
            {slide.points.map((point, pointIndex) => (
              <div key={pointIndex} className="group flex items-center gap-2">
                <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                <Input
                  value={point}
                  onChange={(e) => handlePointChange(pointIndex, e.target.value)}
                  onFocus={handleFocus}
                  className="border-border focus-visible:border-primary rounded-none border-0 border-b px-0 focus-visible:ring-0"
                  placeholder="Bullet point"
                />
                {!isTitle && canRemoveBullet && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      pushHistory()
                      removeBullet(index, pointIndex)
                    }}
                    className="text-muted-foreground hover:text-destructive h-7 w-7 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove bullet point"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {!isTitle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  pushHistory()
                  addBullet(index)
                }}
                className="text-muted-foreground hover:text-foreground mt-1 h-7 gap-1 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add bullet
              </Button>
            )}
          </div>

          {/* Speaker script */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Speaker Script (for AI narration)
            </Label>
            <Textarea
              value={slide.script}
              onChange={(e) => handleScriptChange(e.target.value)}
              onFocus={handleFocus}
              placeholder="Enter the script for AI voice narration..."
              className="min-h-[100px] resize-y"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
