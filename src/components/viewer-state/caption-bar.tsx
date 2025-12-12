'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useNarratorStore } from '@/lib/store'
import { useSettings } from '@/lib/hooks/use-settings'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { useAudio } from '@/lib/audio'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Split text into sentences, preserving the punctuation.
 * Handles common sentence endings: . ! ? and also handles abbreviations somewhat.
 */
function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return []

  // Split on sentence-ending punctuation followed by space or end of string
  // This regex captures the punctuation with the sentence
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  return sentences
}

/**
 * Count words in a string (simple whitespace split)
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length
}

/**
 * Calculate which sentence index should be active based on progress.
 * Uses word count proportions to estimate timing.
 */
function getActiveSentenceIndex(sentences: string[], progress: number): number {
  if (sentences.length === 0) return -1
  if (sentences.length === 1) return 0
  if (progress <= 0) return 0
  if (progress >= 1) return sentences.length - 1

  const wordCounts = sentences.map(countWords)
  const totalWords = wordCounts.reduce((a, b) => a + b, 0)

  if (totalWords === 0) return 0

  // Calculate cumulative progress thresholds
  let cumulative = 0
  for (let i = 0; i < sentences.length; i++) {
    const sentenceProgress = wordCounts[i] / totalWords
    cumulative += sentenceProgress
    if (progress < cumulative) {
      return i
    }
  }

  return sentences.length - 1
}

export function CaptionBar() {
  const getCurrentScript = useNarratorStore((s) => s.getCurrentScript)
  const currentSlide = useNarratorStore((s) => s.currentSlide)
  const isPlaying = useNarratorStore((s) => s.isPlaying)
  const { settings } = useSettings()
  const prefersReducedMotion = useReducedMotion()
  const { progress } = useAudio()

  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLSpanElement>(null)

  const script = getCurrentScript()
  const captionsEnabled = settings.captions.enabled
  const shouldShow = captionsEnabled && script && script.trim().length > 0

  // Memoize sentence splitting
  const sentences = useMemo(() => splitIntoSentences(script), [script])

  // Determine active sentence based on audio progress
  const activeSentenceIndex = useMemo(
    () => getActiveSentenceIndex(sentences, progress),
    [sentences, progress]
  )

  // Auto-scroll to keep active sentence visible
  useEffect(() => {
    if (activeRef.current && containerRef.current && isPlaying) {
      activeRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }, [activeSentenceIndex, isPlaying, prefersReducedMotion])

  // If only one sentence or no sentences, use simple display
  const useSimpleDisplay = sentences.length <= 1

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="caption-bar"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed right-0 bottom-16 left-0 z-40 px-4 sm:px-8"
          role="region"
          aria-label="Captions"
          aria-live="polite"
        >
          <div className="mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className="rounded-xl bg-slate-900/90 px-6 py-4 shadow-lg backdrop-blur-sm"
              >
                <div
                  ref={containerRef}
                  className="max-h-24 overflow-y-auto text-center text-base leading-relaxed sm:text-lg"
                >
                  {useSimpleDisplay ? (
                    <p className="text-white/95">{script}</p>
                  ) : (
                    <p>
                      {sentences.map((sentence, index) => {
                        const isActive = index === activeSentenceIndex
                        const isPast = index < activeSentenceIndex
                        return (
                          <span
                            key={index}
                            ref={isActive ? activeRef : undefined}
                            className={`transition-all duration-200 ${
                              isActive
                                ? 'font-medium text-white'
                                : isPast
                                  ? 'text-white/50'
                                  : 'text-white/70'
                            }`}
                          >
                            {sentence}
                            {index < sentences.length - 1 ? ' ' : ''}
                          </span>
                        )
                      })}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
