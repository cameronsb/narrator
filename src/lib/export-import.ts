import type { NarratorExportFile, PresentationData, Style, Voice } from './types'
import type { SavedPresentation } from './store'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function createExportFile(presentation: SavedPresentation): NarratorExportFile {
  return {
    version: '1.0',
    exportedAt: Date.now(),
    name: presentation.name,
    presentationData: presentation.presentationData,
    audioUrls: presentation.audioUrls,
    style: presentation.style,
    voice: presentation.voice,
  }
}

export function downloadFile(data: NarratorExportFile, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.narrator') ? filename : `${filename}.narrator`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export async function parseImportFile(file: File): Promise<NarratorExportFile> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large (max 10MB)')
  }

  // Check file extension
  const validExtensions = ['.narrator', '.json']
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  if (!hasValidExtension) {
    throw new Error('Please select a .narrator or .json file')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text)
        const validation = validateImportData(data)

        if (!validation.valid) {
          reject(new Error(validation.error))
          return
        }

        resolve(data as NarratorExportFile)
      } catch {
        reject(new Error('This file appears to be corrupted'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export function validateImportData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'This file appears to be corrupted' }
  }

  const obj = data as Record<string, unknown>

  // Check version
  if (obj.version !== '1.0') {
    return { valid: false, error: 'This file was created with an incompatible version' }
  }

  // Check required fields
  const requiredFields = ['name', 'presentationData', 'audioUrls', 'style', 'voice']
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return { valid: false, error: 'This file is missing required data' }
    }
  }

  // Validate presentationData structure
  const presentationData = obj.presentationData as Record<string, unknown>
  if (!presentationData || typeof presentationData !== 'object') {
    return { valid: false, error: 'This file is missing required data' }
  }

  if (!presentationData.metadata || !presentationData.slides) {
    return { valid: false, error: 'This file is missing required data' }
  }

  // Validate metadata
  const metadata = presentationData.metadata as Record<string, unknown>
  if (!metadata.title || !metadata.subtitle || !('titleScript' in metadata)) {
    return { valid: false, error: 'This file is missing required data' }
  }

  // Validate slides is an array with at least one slide
  const slides = presentationData.slides as unknown[]
  if (!Array.isArray(slides) || slides.length === 0) {
    return { valid: false, error: 'This file is missing required data' }
  }

  // Validate each slide has required properties
  for (const slide of slides) {
    const s = slide as Record<string, unknown>
    if (!s.title || !Array.isArray(s.points) || !('script' in s)) {
      return { valid: false, error: 'This file is missing required data' }
    }
  }

  // Validate style
  const validStyles = ['narrative', 'informative']
  if (!validStyles.includes(obj.style as string)) {
    return { valid: false, error: 'This file is missing required data' }
  }

  // Validate voice
  const validVoices = ['alloy', 'nova', 'shimmer', 'echo', 'onyx', 'fable']
  if (!validVoices.includes(obj.voice as string)) {
    return { valid: false, error: 'This file is missing required data' }
  }

  return { valid: true }
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50)
}

export function getImportPreview(data: NarratorExportFile): {
  name: string
  slideCount: number
  style: Style
  voice: Voice
  presentationData: PresentationData
} {
  return {
    name: data.name,
    slideCount: data.presentationData.slides.length + 1, // +1 for title slide
    style: data.style,
    voice: data.voice,
    presentationData: data.presentationData,
  }
}
