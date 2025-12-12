'use client'

import { useNarratorStore } from '@/lib/store'
import { ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const MODEL_INFO = {
  slides: {
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
  },
  audio: {
    name: 'TTS-1',
    provider: 'OpenAI',
    docsUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
  },
} as const

function PulsingDots() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="bg-primary h-3 w-3 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function ShimmerBar() {
  return (
    <div className="bg-primary/20 relative h-2 w-72 overflow-hidden rounded-full">
      <motion.div
        className="via-primary absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent to-transparent"
        animate={{
          x: ['-100%', '400%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export function LoadingOverlay() {
  const isLoading = useNarratorStore((s) => s.isLoading)
  const loadingText = useNarratorStore((s) => s.loadingText)
  const loadingSubtext = useNarratorStore((s) => s.loadingSubtext)

  // Determine which model is being used based on loading text
  const isAudioGeneration = loadingText?.toLowerCase().includes('audio')
  const modelInfo = isAudioGeneration ? MODEL_INFO.audio : MODEL_INFO.slides

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <PulsingDots />

          <h2 className="text-foreground mb-2 text-xl font-semibold">
            {loadingText || 'Loading...'}
          </h2>

          {loadingSubtext && <p className="text-muted-foreground mb-6">{loadingSubtext}</p>}

          <ShimmerBar />

          {/* Model info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Powered by <span className="text-foreground font-medium">{modelInfo.name}</span>
              <span className="text-muted-foreground/60"> by {modelInfo.provider}</span>
            </p>
            <a
              href={modelInfo.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 mt-1 inline-flex items-center gap-1 text-xs transition-colors"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
