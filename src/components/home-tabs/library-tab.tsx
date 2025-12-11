'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNarratorStore } from '@/lib/store'
import { FolderOpen, Trash2, FileText, Library, Sparkles, Download, MoreHorizontal, PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { ExportButton } from '@/components/export-import'
import type { TabId } from './home-tabs'

interface LibraryTabProps {
  onSwitchTab: (tab: TabId) => void
}

export function LibraryTab({ onSwitchTab }: LibraryTabProps) {
  const savedPresentations = useNarratorStore((s) => s.savedPresentations)
  const loadPresentation = useNarratorStore((s) => s.loadPresentation)
  const deletePresentation = useNarratorStore((s) => s.deletePresentation)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleLoad = (id: string, name: string) => {
    loadPresentation(id)
    toast.success(`Loaded "${name}"`)
  }

  const handleDelete = (id: string, name: string) => {
    if (deletingId === id) {
      deletePresentation(id)
      toast.success(`Deleted "${name}"`)
      setDeletingId(null)
    } else {
      setDeletingId(id)
      toast.info('Click delete again to confirm')
      setTimeout(() => {
        setDeletingId(null)
      }, 3000)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours}h ago`
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays)
      return `${days}d ago`
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  // Empty state
  if (savedPresentations.length === 0) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Library className="text-muted-foreground h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No presentations yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Create your first presentation or import an existing .narrator file to get started.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => onSwitchTab('create')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Create New
            </Button>
            <Button variant="outline" onClick={() => onSwitchTab('import')}>
              <Download className="mr-2 h-4 w-4" />
              Import File
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Library grid view
  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Presentations</h2>
          <span className="text-muted-foreground text-sm">
            {savedPresentations.length} presentation{savedPresentations.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedPresentations
            .slice()
            .reverse()
            .map((presentation) => (
              <Card
                key={presentation.id}
                className="group relative transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-4">
                  {/* Card header with icon */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      presentation.isDraft ? 'bg-amber-500/10' : 'bg-primary/10'
                    }`}>
                      {presentation.isDraft ? (
                        <PenLine className="h-5 w-5 text-amber-500" />
                      ) : (
                        <FileText className="text-primary h-5 w-5" />
                      )}
                    </div>
                    {/* Action menu button */}
                    <div className="flex gap-1">
                      <ExportButton presentation={presentation} variant="ghost" size="icon" iconOnly />
                      <Button
                        size="icon"
                        variant={deletingId === presentation.id ? 'destructive' : 'ghost'}
                        onClick={() => handleDelete(presentation.id, presentation.name)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Title with draft indicator */}
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="truncate font-semibold" title={presentation.name}>
                      {presentation.name}
                    </h3>
                    {presentation.isDraft && (
                      <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-x-2 text-xs">
                    <span>{presentation.presentationData.slides.length + 1} slides</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{formatDate(presentation.savedAt)}</span>
                  </div>

                  {/* Open button */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleLoad(presentation.id, presentation.name)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
