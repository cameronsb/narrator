'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNarratorStore } from '@/lib/store'
import { FolderOpen, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { ExportButton } from '@/components/export-import'

export function SavedPresentations() {
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
      // Confirm delete
      deletePresentation(id)
      toast.success(`Deleted "${name}"`)
      setDeletingId(null)
    } else {
      // First click - ask for confirmation
      setDeletingId(id)
      toast.info('Click delete again to confirm')
      // Reset confirmation after 3 seconds
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
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays)
      return `${days} day${days === 1 ? '' : 's'} ago`
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  if (savedPresentations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-muted-foreground/20 w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="text-muted-foreground bg-white px-4 py-2 font-medium">
            Or load a saved presentation
          </span>
        </div>
      </div>

      <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
        {savedPresentations
          .slice()
          .reverse()
          .map((presentation) => (
            <Card key={presentation.id} className="shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="text-primary h-4 w-4 shrink-0" />
                      <h3 className="truncate text-base font-semibold">{presentation.name}</h3>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                      <span>{presentation.presentationData.slides.length + 1} slides</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{formatDate(presentation.savedAt)}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="capitalize">{presentation.style}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="capitalize">{presentation.voice}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoad(presentation.id, presentation.name)}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <FolderOpen className="mr-1 h-4 w-4" />
                      Open
                    </Button>
                    <ExportButton presentation={presentation} />
                    <Button
                      size="sm"
                      variant={deletingId === presentation.id ? 'destructive' : 'outline'}
                      onClick={() => handleDelete(presentation.id, presentation.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
