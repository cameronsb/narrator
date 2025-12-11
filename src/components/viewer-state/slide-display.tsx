'use client'

import { useNarratorStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

export function SlideDisplay() {
  const presentationData = useNarratorStore((s) => s.presentationData)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const prefersReducedMotion = useReducedMotion()

  if (!presentationData) return null

  // Get current slide content
  const isTitle = currentSlide === 0
  const slide = isTitle
    ? {
        title: presentationData.metadata.title,
        points: presentationData.metadata.subtitle ? [presentationData.metadata.subtitle] : [],
      }
    : presentationData.slides[currentSlide - 1]

  if (!slide) return null

  // Animation config respecting reduced motion preference
  const slideTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut' }

  const pointTransition = (index: number) =>
    prefersReducedMotion
      ? { duration: 0 }
      : { delay: 0.2 + index * 0.1, duration: 0.3 }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 sm:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
          transition={slideTransition}
          className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl sm:p-12 md:p-16"
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
