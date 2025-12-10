'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useNarratorStore } from '@/lib/store'
import { motion } from 'framer-motion'

interface SlideCardProps {
  index: number
  isTitle?: boolean
}

export function SlideCard({ index, isTitle = false }: SlideCardProps) {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const updateSlide = useNarratorStore((s) => s.updateSlide)
  const updateMetadata = useNarratorStore((s) => s.updateMetadata)

  if (!presentationData) return null

  // For title slide (index 0), use metadata
  const slide = isTitle
    ? {
        title: presentationData.metadata.title,
        points: [presentationData.metadata.subtitle],
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
              {isTitle ? 'T' : index + 1}
            </div>
            <Input
              value={slide.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="focus-visible:border-primary rounded-none border-0 border-b-2 border-transparent px-0 text-xl font-semibold focus-visible:ring-0"
              placeholder="Slide title"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bullet points */}
          <div className="space-y-3">
            {slide.points.map((point, pointIndex) => (
              <div key={pointIndex} className="flex items-center gap-3">
                <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                <Input
                  value={point}
                  onChange={(e) => handlePointChange(pointIndex, e.target.value)}
                  className="border-border focus-visible:border-primary rounded-none border-0 border-b px-0 focus-visible:ring-0"
                  placeholder="Bullet point"
                />
              </div>
            ))}
          </div>

          {/* Speaker script */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Speaker Script (for AI narration)
            </Label>
            <Textarea
              value={slide.script}
              onChange={(e) => handleScriptChange(e.target.value)}
              placeholder="Enter the script for AI voice narration..."
              className="min-h-[100px] resize-y"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
