'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import type { SavedPresentation } from '@/lib/store'
import { createExportFile, downloadFile, sanitizeFilename } from '@/lib/export-import'

interface ExportButtonProps {
  presentation: SavedPresentation
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
}

export function ExportButton({
  presentation,
  variant = 'outline',
  size = 'sm',
  iconOnly = true,
}: ExportButtonProps) {
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
    <Button
      size={size}
      variant={variant}
      onClick={handleExport}
      title="Export presentation"
      className={size === 'icon' ? 'h-8 w-8' : undefined}
    >
      <Download className={iconOnly ? 'h-4 w-4' : 'mr-2 h-4 w-4'} />
      {iconOnly ? <span className="sr-only">Export</span> : 'Export'}
    </Button>
  )
}
