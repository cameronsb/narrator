'use client'

import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import { useNarratorStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

const MIN_SCALE = 0.5

/**
 * Hook that calculates scale factor and max-height to fit content in a container.
 *
 * Strategy (like PowerPoint/Keynote):
 * 1. Scale content down to fit (never up)
 * 2. If content exceeds what min-scale can handle, constrain with max-height
 * 3. The max-height allows internal scrolling as a last resort
 *
 * Math: maxHeight × minScale = availableHeight
 * This ensures the card always fits visually, even when scrollable.
 */
function useScaleToFit(
  containerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  deps: unknown[] = []
): { scale: number; maxHeight: number | undefined } {
  const [scale, setScale] = useState(1)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  const measure = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const availableW = container.clientWidth
    const availableH = container.clientHeight

    // scrollHeight returns full content height even with overflow/maxHeight
    const naturalW = content.scrollWidth
    const naturalH = content.scrollHeight

    if (naturalW === 0 || naturalH === 0 || availableH === 0) return

    // Max card height: at MIN_SCALE, card must fit available height
    // This is our "overflow threshold" - content beyond this scrolls
    const cardMaxH = availableH / MIN_SCALE
    setMaxHeight(cardMaxH)

    // Effective height for scale calculation (capped at max)
    const effectiveH = Math.min(naturalH, cardMaxH)

    // Calculate scale factors for both dimensions
    const scaleX = availableW / naturalW
    const scaleY = availableH / effectiveH

    // Use smaller factor (fit both), never upscale, respect minimum
    const newScale = Math.max(MIN_SCALE, Math.min(scaleX, scaleY, 1))

    setScale(newScale)
  }, [containerRef, contentRef])

  useLayoutEffect(() => {
    // Small delay ensures content is rendered before measuring
    const timer = setTimeout(measure, 50)

    const container = containerRef.current
    if (!container) return () => clearTimeout(timer)

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(container)
    window.addEventListener('resize', measure)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps])

  return { scale, maxHeight }
}

export function SlideDisplay() {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const prefersReducedMotion = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scale content to fit, with max-height fallback for extreme content
  const { scale, maxHeight } = useScaleToFit(containerRef, contentRef, [currentSlide])

  if (!presentationData) return null

  const isTitle = currentSlide === 0
  const slide = isTitle
    ? {
        title: presentationData.metadata.title,
        points: presentationData.metadata.subtitle ? [presentationData.metadata.subtitle] : [],
      }
    : presentationData.slides[currentSlide - 1]

  if (!slide) return null

  const slideTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut' as const }

  const pointTransition = (index: number) =>
    prefersReducedMotion ? { duration: 0 } : { delay: 0.2 + index * 0.1, duration: 0.3 }

  return (
    // Container: available viewport space between fixed UI elements
    // Overflow visible so scaled content's layout box can extend without clipping
    <div
      ref={containerRef}
      className="fixed inset-0 top-16 bottom-44 flex items-center justify-center overflow-visible px-4 sm:bottom-36 sm:px-8"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
          transition={slideTransition}
          className="w-full max-w-4xl"
        >
          {/*
            Scale wrapper with max-height constraint.
            - Scales down to fit viewport (min 0.5x)
            - If content exceeds maxHeight, internal scroll kicks in
            - maxHeight calculated so card always fits at min scale
          */}
          <div
            ref={contentRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              maxHeight: maxHeight,
            }}
            className="overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-200 sm:p-12 md:p-16"
          >
            <h1 className="mb-8 text-2xl leading-tight font-bold text-gray-900 sm:text-3xl md:text-4xl">
              {slide.title}
            </h1>

            {slide.points && slide.points.length > 0 && (
              <ul className="space-y-4 sm:space-y-6">
                {slide.points.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={pointTransition(index)}
                    className="flex items-start gap-4 text-lg text-gray-700 sm:text-xl md:text-2xl"
                  >
                    <span className="bg-primary mt-2 h-3 w-3 flex-shrink-0 rounded-full" />
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
