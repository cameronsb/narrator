'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { parseImportFile } from '@/lib/export-import'
import type { NarratorExportFile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ImportZoneProps {
  onImport: (data: NarratorExportFile) => void
}

export function ImportZone({ onImport }: ImportZoneProps) {
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
    // Reset input so the same file can be selected again
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
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-muted-foreground/20 w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="text-muted-foreground bg-white px-4 py-2 font-medium">
            Or import from file
          </span>
        </div>
      </div>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <Upload
          className={cn('h-8 w-8', isDragging ? 'text-primary' : 'text-muted-foreground')}
        />
        <div className="text-center">
          <p className="text-sm font-medium">Import Presentation</p>
          <p className="text-muted-foreground text-xs">Click to browse or drag & drop</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".narrator,.json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
