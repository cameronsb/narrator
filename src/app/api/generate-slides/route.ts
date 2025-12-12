import { NextRequest, NextResponse } from 'next/server'

// Presentation style configurations with toolkit approach
const STYLES = {
  narrative: {
    description: 'Persuasive, story-driven presentation',
    instructions: `Create a NARRATIVE presentation that persuades and inspires action.

TOOLKIT - use these techniques if (and only if) they serve the content (not mechanically on every slide):
- Story arc: setup → tension/challenge → resolution
- Rhetorical questions to engage the audience
- Analogies and metaphors to make abstract concepts vivid
- Contrast: before/after, problem/solution, old way/new way
- Emotional stakes: why this matters, what's at risk, what's possible
- Direct "you" language to address the audience personally
- Clear call to action toward the end

GOAL: Move the audience toward action, belief, or decision.
TONE: Conversational, engaging, builds momentum.
Scripts should feel like someone telling a compelling story.`,
  },
  informative: {
    description: 'Clear, educational presentation',
    instructions: `Create an INFORMATIVE presentation that clarifies and educates.

TOOLKIT - use these techniques if (and only if) they serve the content (not mechanically on every slide):
- Logical organization: by topic, chronology, or priority
- Clear definitions for terminology or concepts
- Concrete examples to illustrate abstract points
- Data and evidence to support claims
- Summaries to reinforce key takeaways
- Neutral, precise language

GOAL: Help the audience understand clearly and retain information.
TONE: Clear, organized, authoritative but accessible.
Scripts should explain concepts thoroughly but efficiently.`,
  },
} as const

// TODO: Add few-shot examples for each style to improve output consistency

// Expected JSON output schema (for prompt)
const OUTPUT_SCHEMA = `{
    "metadata": {
        "title": "Compelling presentation title",
        "subtitle": "Brief subtitle or tagline",
        "titleScript": "Welcome script for the title slide (30-60 seconds when spoken)"
    },
    "slides": [
        {
            "title": "Slide title",
            "points": ["Key point 1", "Key point 2", "Key point 3"],
            "script": "Speaker script for this slide (30-60 seconds when spoken)"
        }
    ]
}`

/**
 * Build the prompt for slide generation
 */
function buildPrompt(text: string, style: keyof typeof STYLES): string {
  const styleConfig = STYLES[style] || STYLES.narrative

  return `Transform this content into a presentation slideshow.

CONTENT:
${text}

STYLE: ${style}
${styleConfig.instructions}

Output ONLY valid JSON matching this exact structure:
${OUTPUT_SCHEMA}

Guidelines:
- Create 5-10 slides depending on content depth
- Each slide should have 2-4 bullet points
- Scripts should be natural, conversational text suitable for voice narration
- No markdown formatting in the JSON values
- Ensure valid JSON syntax`
}

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
function parseSlideJSON(content: string) {
  let jsonStr = content

  // Strip markdown code blocks if present
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1]
  }

  // Extract JSON object
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    jsonStr = objectMatch[0]
  }

  try {
    return JSON.parse(jsonStr)
  } catch {
    console.error('JSON parse failed:', jsonStr.substring(0, 500))
    throw new Error('Failed to parse AI response as JSON')
  }
}

/**
 * Generate slides using Claude (Anthropic)
 */
async function generateWithClaude(text: string, style: keyof typeof STYLES, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: buildPrompt(text, style),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return parseSlideJSON(data.content[0].text)
}

/**
 * Generate slides using GPT-4 (OpenAI)
 */
async function generateWithOpenAI(text: string, style: keyof typeof STYLES, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: 'You are an expert presentation designer. Output only valid JSON.',
        },
        {
          role: 'user',
          content: buildPrompt(text, style),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return parseSlideJSON(data.choices[0].message.content)
}

/**
 * POST /api/generate-slides
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, style = 'narrative' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }

    // Prefer Claude if available, fallback to OpenAI
    const result = anthropicKey
      ? await generateWithClaude(text, style, anthropicKey)
      : await generateWithOpenAI(text, style, openaiKey!)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Slide generation error:', error)
    return NextResponse.json({ error: 'Failed to generate slides' }, { status: 500 })
  }
}
