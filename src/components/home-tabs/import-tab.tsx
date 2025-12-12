'use client'

import { useRef, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Upload } from 'lucide-react'
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
      <CardContent className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Import Presentation</h2>
          <p className="text-muted-foreground text-sm">Open a .narrator file shared with you</p>
        </div>

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn('h-5 w-5', isDragging ? 'text-primary' : 'text-muted-foreground')}
            />
          </div>
          <div className="text-center">
            <p className="font-medium">Drop .narrator file here</p>
            <p className="text-muted-foreground text-sm">or click to browse</p>
          </div>
        </div>

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
