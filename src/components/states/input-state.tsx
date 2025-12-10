'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  StyleSelector,
  ContentInput,
  ExampleButtons,
  GenerateButton,
} from '@/components/input-state'
import { SavedPresentations } from '@/components/saved-presentations'
import { motion } from 'framer-motion'

export function InputState() {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-3xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="space-y-8 p-8 sm:p-12">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className="text-brand-600 text-4xl font-bold sm:text-5xl">Narrator</h1>
              <p className="text-muted-foreground text-lg">
                Transform any text into an AI-narrated presentation
              </p>
            </div>

            {/* Content Input */}
            <ContentInput />

            {/* Style Selector */}
            <StyleSelector />

            {/* Example Buttons */}
            <ExampleButtons />

            {/* Generate Button */}
            <GenerateButton />

            {/* Saved Presentations */}
            <SavedPresentations />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
