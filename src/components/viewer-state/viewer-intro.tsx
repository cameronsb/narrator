'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { useAudio } from '@/lib/audio'
import { motion, AnimatePresence } from 'framer-motion'

export function ViewerIntro() {
  const [visible, setVisible] = useState(true)
  const presentationData = useNarratorStore((s) => s.presentationData)

  const { play } = useAudio()

  if (!presentationData) return null

  const handleStart = () => {
    setVisible(false)
    setTimeout(play, 300)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/97"
        >
          <div className="max-w-2xl px-8 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-4xl font-bold sm:text-5xl"
            >
              {presentationData.metadata.title}
            </motion.h1>

            {presentationData.metadata.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10 text-xl text-white/80"
              >
                {presentationData.metadata.subtitle}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handleStart}
                className="text-brand-600 rounded-full bg-white px-12 py-6 text-xl hover:bg-white/90"
              >
                <Play className="mr-3 h-6 w-6" />
                Start Presentation
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 space-y-2 text-sm text-white/60"
            >
              <p>Audio narration will play automatically</p>
              <p>Use arrow keys to navigate</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
