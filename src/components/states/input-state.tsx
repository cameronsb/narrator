'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  StyleSelector,
  ContentInput,
  ExampleButtons,
  GenerateButton,
} from '@/components/input-state'
import { ImportDialog } from '@/components/export-import'
import { HomeTabs, LibraryTab, ImportTab, type TabId } from '@/components/home-tabs'
import { motion, AnimatePresence } from 'framer-motion'
import type { NarratorExportFile } from '@/lib/types'
import { useNarratorStore } from '@/lib/store'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

export function InputState() {
  const savedPresentations = useNarratorStore((s) => s.savedPresentations)
  const prefersReducedMotion = useReducedMotion()

  // Default to Library tab if user has presentations, otherwise Create
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    savedPresentations.length > 0 ? 'library' : 'create'
  )
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<NarratorExportFile | null>(null)

  const handleImport = (data: NarratorExportFile) => {
    setPendingImport(data)
    setImportDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setImportDialogOpen(open)
    if (!open) {
      setPendingImport(null)
    }
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
  }

  // Animation config respecting reduced motion preference
  const tabTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const }

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
        className="w-full max-w-3xl space-y-6"
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-brand-600 text-4xl font-bold sm:text-5xl">Narrator</h1>
          <p className="text-muted-foreground text-lg">
            Transform any text into an AI-narrated presentation
          </p>
        </div>

        {/* Tabs */}
        <HomeTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          libraryCount={savedPresentations.length}
        />

        {/* Tab content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={tabTransition}
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={activeTab}
          >
            {activeTab === 'create' && (
              <Card className="border-0 shadow-2xl">
                <CardContent className="space-y-8 p-8 sm:p-12">
                  {/* Content Input */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      What do you want to present?
                    </label>
                    <ContentInput />
                  </div>

                  {/* Style Selector */}
                  <StyleSelector />

                  {/* Example Buttons */}
                  <ExampleButtons />

                  {/* Generate Button */}
                  <GenerateButton />
                </CardContent>
              </Card>
            )}

            {activeTab === 'library' && <LibraryTab onSwitchTab={handleTabChange} />}

            {activeTab === 'import' && <ImportTab onImport={handleImport} />}
          </motion.div>
        </AnimatePresence>

        {/* Import Dialog (shared across tabs) */}
        <ImportDialog
          open={importDialogOpen}
          onOpenChange={handleDialogClose}
          data={pendingImport}
        />
      </motion.div>
    </div>
  )
}
