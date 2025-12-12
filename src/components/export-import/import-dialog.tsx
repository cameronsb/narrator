'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Play, Pencil } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { getImportPreview } from '@/lib/export-import'
import { STYLE_CONFIG, VOICE_CONFIG } from '@/lib/types'
import type { NarratorExportFile } from '@/lib/types'
import { toast } from 'sonner'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: NarratorExportFile | null
}

export function ImportDialog({ open, onOpenChange, data }: ImportDialogProps) {
  const importPresentation = useNarratorStore((s) => s.importPresentation)

  if (!data) return null

  const preview = getImportPreview(data)

  const handleImport = (mode: 'view' | 'edit') => {
    importPresentation(data, mode)
    onOpenChange(false)
    toast.success(`Imported "${preview.name}" and saved to library`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Presentation</DialogTitle>
          <DialogDescription>This presentation will be added to your library.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <FileText className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold">{preview.name}</h3>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span>{preview.slideCount} slides</span>
                <span className="text-muted-foreground/40">|</span>
                <span>{STYLE_CONFIG[preview.style].label}</span>
                <span className="text-muted-foreground/40">|</span>
                <span>{VOICE_CONFIG[preview.voice].label}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleImport('edit')}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Open for Editing
          </Button>
          <Button onClick={() => handleImport('view')}>
            <Play className="mr-1.5 h-4 w-4" />
            Present Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
