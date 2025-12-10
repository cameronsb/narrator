'use client'

import { useNarratorStore } from '@/lib/store'
import { Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function DemoModeBanner() {
  const isDemoMode = useNarratorStore((s) => s.isDemoMode)
  const appState = useNarratorStore((s) => s.appState)

  // Only show in preview or viewer states when in demo mode
  if (!isDemoMode || appState === 'input') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 shadow-lg"
      >
        <Info className="h-4 w-4" />
        Demo Mode - AI features simulated
      </motion.div>
    </AnimatePresence>
  )
}
