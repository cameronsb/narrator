'use client'

import { useRef, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { parseImportFile } from '@/lib/export-import'
import type { NarratorExportFile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ImportTabProps {
  onImport: (data: NarratorExportFile) => void
}

export function ImportTab({ onImport }: ImportTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const data = await parseImportFile(file)
        onImport(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to import file')
      }
    },
    [onImport]
  )

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="flex flex-col items-center px-8 py-12 text-center">
        {/* Header */}
        <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Download className="text-muted-foreground h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Import Presentation</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Open a .narrator file shared with you
        </p>

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex w-full max-w-md cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn('h-6 w-6', isDragging ? 'text-primary' : 'text-muted-foreground')}
            />
          </div>
          <div>
            <p className="font-medium">Drop file here</p>
            <p className="text-muted-foreground text-sm">or click to browse</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            Browse Files
          </Button>
        </div>

        {/* File types hint */}
        <p className="text-muted-foreground mt-6 text-xs">Accepts .narrator files</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".narrator,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
