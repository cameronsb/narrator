'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useNarratorStore } from '@/lib/store'
import { toast } from 'sonner'
import type { PresentationData } from '@/lib/types'

// Mock slide generation for demo mode
function generateMockSlides(text: string): PresentationData {
  const lines = text.split('\n').filter((l) => l.trim())
  const title = lines[0] || 'Untitled Presentation'

  const slides: PresentationData['slides'] = []
  let currentSlide: PresentationData['slides'][0] | null = null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Detect headers (lines that are short and might be titles)
    if (
      line.length < 60 &&
      !line.startsWith('-') &&
      !line.startsWith('•') &&
      !line.match(/^\d+\./)
    ) {
      if (currentSlide) slides.push(currentSlide)
      currentSlide = {
        title: line.replace(/[:\.]$/, ''),
        points: [],
        script: '',
      }
    } else if (currentSlide) {
      // Add as bullet point
      const cleanLine = line.replace(/^[-•\d.)\s]+/, '').trim()
      if (cleanLine) {
        currentSlide.points.push(cleanLine)
        currentSlide.script += cleanLine + '. '
      }
    }
  }

  if (currentSlide) slides.push(currentSlide)

  // Ensure we have at least one slide
  if (slides.length === 0) {
    slides.push({
      title: 'Key Points',
      points: lines.slice(1, 5).map((l) => l.trim()),
      script: lines.slice(1, 5).join('. '),
    })
  }

  return {
    metadata: {
      title: title,
      subtitle: 'Generated with AI',
      titleScript: `Welcome to this presentation about ${title}. Let's dive in.`,
    },
    slides: slides.map((s) => ({
      ...s,
      script: s.script || `Let's discuss ${s.title}.`,
    })),
  }
}

export function GenerateButton() {
  const content = useNarratorStore((s) => s.content)
  const style = useNarratorStore((s) => s.style)
  const isLoading = useNarratorStore((s) => s.isLoading)
  const setLoading = useNarratorStore((s) => s.setLoading)
  const setLoadingProgress = useNarratorStore((s) => s.setLoadingProgress)
  const setPresentationData = useNarratorStore((s) => s.setPresentationData)
  const setAppState = useNarratorStore((s) => s.setAppState)
  const setDemoMode = useNarratorStore((s) => s.setDemoMode)

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Please enter some text first')
      return
    }

    setLoading(
      true,
      'Generating your presentation...',
      'AI is structuring your content into slides'
    )
    setLoadingProgress(20)

    try {
      setLoadingProgress(40)
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, style }),
      })

      setLoadingProgress(80)

      if (!response.ok) throw new Error('Failed to generate slides')

      const data = await response.json()
      setLoadingProgress(100)
      setPresentationData(data)
      setDemoMode(false)
      setLoading(false)
      setAppState('preview')
      toast.success('Slides generated successfully!')
    } catch (error) {
      console.error('Error:', error)
      // Fallback to mock data for demo
      setLoadingProgress(100)
      const mockData = generateMockSlides(content)
      setPresentationData(mockData)
      setDemoMode(true)
      setLoading(false)
      setAppState('preview')
      toast.info('Using local generation (API unavailable)')
    }
  }

  const isDisabled = isLoading || content.trim().length < 50

  return (
    <Button
      onClick={handleGenerate}
      disabled={isDisabled}
      size="lg"
      className="bg-brand-500 hover:bg-brand-600 w-full py-6 text-lg text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Presentation'
      )}
    </Button>
  )
}
