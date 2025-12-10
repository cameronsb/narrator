import { NextRequest, NextResponse } from 'next/server'

// Available OpenAI TTS voices
const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
type Voice = (typeof VOICES)[number]

// OpenAI TTS character limit
const MAX_SCRIPT_LENGTH = 4000

/**
 * Generate audio for a single script using OpenAI TTS
 */
async function generateAudio(
  script: string,
  voice: Voice,
  apiKey: string,
  slideIndex: number
): Promise<Buffer> {
  // Handle empty scripts
  const text = script?.trim() || 'Next slide.'

  // Truncate to API limit
  const truncatedText = text.substring(0, MAX_SCRIPT_LENGTH)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: truncatedText,
      voice: voice,
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`TTS error for slide ${slideIndex}:`, errorText)
    throw new Error(`TTS API error: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * POST /api/generate-audio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scripts, voice = 'nova' } = body

    if (!Array.isArray(scripts) || scripts.length === 0) {
      return NextResponse.json({ error: 'Scripts array is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Validate voice selection
    const selectedVoice: Voice = VOICES.includes(voice) ? voice : 'nova'

    // Generate audio for all scripts in parallel
    const audioBuffers = await Promise.all(
      scripts.map((script: string, i: number) => generateAudio(script, selectedVoice, apiKey, i))
    )

    // Convert to base64 data URLs
    const audioUrls = audioBuffers.map(
      (buffer) => `data:audio/mpeg;base64,${buffer.toString('base64')}`
    )

    return NextResponse.json({ audioUrls })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
  }
}
