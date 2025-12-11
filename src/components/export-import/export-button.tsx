'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import type { SavedPresentation } from '@/lib/store'
import { createExportFile, downloadFile, sanitizeFilename } from '@/lib/export-import'

interface ExportButtonProps {
  presentation: SavedPresentation
}

export function ExportButton({ presentation }: ExportButtonProps) {
  const handleExport = () => {
    try {
      const exportData = createExportFile(presentation)
      const filename = sanitizeFilename(presentation.name) || 'presentation'
      downloadFile(exportData, `${filename}.narrator`)
      toast.success(`Exported "${presentation.name}"`)
    } catch {
      toast.error('Failed to export presentation')
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport} title="Export presentation">
      <Download className="h-4 w-4" />
    </Button>
  )
}
