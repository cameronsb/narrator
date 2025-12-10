# Narrator - Architecture & Design Decisions

A demo application that transforms text into AI-narrated slideshow presentations.

## Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Input      │ ──▶ │   Preview    │ ──▶ │   Viewer    │
│  (text)     │     │   (edit)     │     │   (play)    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
  Claude/GPT-4o      OpenAI TTS           HTML5 Audio
  (slide gen)        (voice gen)          (playback)
```

## Tech Stack

| Layer         | Technology                          | Why                                             |
| ------------- | ----------------------------------- | ----------------------------------------------- |
| Framework     | Next.js 16 (App Router)             | Server-side API routes, React 19                |
| State         | Zustand                             | Lightweight, no boilerplate, persist middleware |
| Styling       | Tailwind CSS v4                     | Rapid prototyping, consistent design            |
| UI Components | Radix UI + shadcn/ui                | Accessible, unstyled primitives                 |
| Animation     | Framer Motion                       | Declarative animations                          |
| AI (Slides)   | Claude Sonnet 4.5 / GPT-4o fallback | Structured JSON generation                      |
| AI (Audio)    | OpenAI TTS (`tts-1`)                | Only major TTS API with quality voices          |

## API Architecture

### `/api/generate-slides` (POST)

**Input:** `{ text: string, style: 'narrative' | 'minimal' | 'educational' | 'creative' }`

**Process:**

1. Build prompt with style-specific instructions
2. Call Claude Sonnet 4.5 (or GPT-4o if no Anthropic key)
3. Parse JSON from response (handles markdown code blocks)
4. Return structured presentation data

**Output:**

```typescript
{
  metadata: { title, subtitle, titleScript },
  slides: [{ title, points: string[], script }]
}
```

**Model:** `claude-sonnet-4-5-20250929`

- Best-in-class for agents and coding tasks
- ~$3/1M input, ~$15/1M output tokens
- Reliable JSON output, extended thinking capabilities

### `/api/generate-audio` (POST)

**Input:** `{ scripts: string[], voice: Voice }`

**Process:**

1. Generate audio for all scripts in parallel
2. Convert to base64 data URLs
3. Return array of audio URLs

**Output:** `{ audioUrls: string[] }`

**Model:** `tts-1` (OpenAI)

- 6 voices: alloy, echo, fable, onyx, nova, shimmer
- 4000 character limit per request
- Returns MP3 audio

**Tradeoff:** `tts-1-hd` available for higher quality at 2x cost.

## State Management

### Zustand Store (Session State)

Ephemeral state that resets on page refresh:

```typescript
- appState: 'input' | 'preview' | 'viewer'
- content: string           // User's input text
- style: Style              // Selected presentation style
- voice: Voice              // Selected TTS voice
- presentationData: {...}   // Generated slides
- audioUrls: Record<n, url> // Generated audio
- currentSlide: number
- isPlaying, isMuted, etc.
```

### Settings (localStorage via `useSettings`)

Persistent user preferences:

```typescript
{
  playback: {
    volume: 0.5,      // 0-1, exponential scaling
    speed: 1.2,       // 0.5x - 2.5x
    autoAdvance: true
  }
}
```

**Volume Algorithm:** Exponential scaling for perceptually linear control

```typescript
actualVolume = sliderValue ^ 2
// 50% slider → 25% actual volume (soft default)
// 63% slider → 40% actual volume (unity)
// 100% slider → 100% actual volume
```

### Saved Presentations (localStorage via Zustand persist)

```typescript
SavedPresentation {
  id: string
  name: string
  savedAt: timestamp
  presentationData: {...}
  audioUrls: Record<number, string>  // Base64 audio data
  style, voice
}
```

**Storage Key:** `narrator-storage`

## Design Tradeoffs

### 1. Base64 Audio URLs vs. File Storage

**Chose:** Base64 data URLs stored in localStorage

**Pros:**

- No server storage needed
- Works offline after generation
- Simple implementation

**Cons:**

- Large storage footprint (~100-500KB per slide)
- localStorage ~5MB limit = ~10-50 presentations max
- Can't share presentations via URL

**Alternative:** Could use IndexedDB for larger storage, or server-side storage for sharing.

### 2. Client-Side State vs. Database

**Chose:** All state in browser (Zustand + localStorage)

**Pros:**

- No backend infrastructure needed
- Privacy (data stays on device)
- Fast, no network latency for state

**Cons:**

- No cross-device sync
- Data loss if browser storage cleared
- Can't collaborate or share

**Alternative:** Supabase/Firebase for auth + cloud storage.

### 3. Parallel Audio Generation

**Chose:** Generate all slide audio in parallel (`Promise.all`)

**Pros:**

- Much faster (10 slides in ~3s vs ~30s sequential)
- Better UX

**Cons:**

- Higher burst API usage
- If one fails, all fail (could add retry logic)

### 4. Style System

**Chose:** 4 preset styles with fixed prompts

**Pros:**

- Predictable, tested output quality
- Simple UX

**Cons:**

- No custom style creation
- Can't fine-tune per-presentation

**Alternative:** Allow custom prompt templates or style mixing.

### 5. No Streaming

**Chose:** Wait for complete response

**Pros:**

- Simpler implementation
- JSON parsing is straightforward

**Cons:**

- Longer perceived wait time
- No progressive feedback

**Alternative:** Stream slides as they're generated (complex with JSON structure).

## Cost Analysis

**Per presentation (assuming 8 slides, ~500 words input):**

| Service          | Model             | Cost            |
| ---------------- | ----------------- | --------------- |
| Slide generation | Claude Sonnet 4.5 | ~$0.02-0.05     |
| Audio generation | OpenAI TTS        | ~$0.10-0.20     |
| **Total**        |                   | **~$0.12-0.25** |

Audio is the dominant cost due to per-character pricing.

## Security Considerations

- API keys stored in environment variables (server-side only)
- No user authentication (demo app)
- No input sanitization beyond basic validation
- CORS handled by Next.js defaults

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-slides/route.ts  # Claude/GPT-4o integration
│   │   └── generate-audio/route.ts   # OpenAI TTS integration
│   ├── page.tsx                      # Main app entry
│   └── layout.tsx                    # Root layout
├── components/
│   ├── states/                       # Main app screens
│   │   ├── input-state.tsx
│   │   ├── preview-state.tsx
│   │   └── viewer-state.tsx
│   ├── input-state/                  # Input screen components
│   ├── preview-state/                # Preview screen components
│   ├── viewer-state/                 # Viewer screen components
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── store.ts                      # Zustand store
│   ├── settings.ts                   # Settings types & defaults
│   ├── types.ts                      # TypeScript types
│   ├── hooks/
│   │   ├── use-audio-player.ts       # Audio playback logic
│   │   ├── use-settings.ts           # Persistent settings
│   │   ├── use-local-storage.ts      # localStorage hook
│   │   └── use-keyboard-navigation.ts
│   └── utils.ts                      # Utility functions
```

## Potential Improvements

1. **IndexedDB storage** - Handle larger presentations
2. **Export to video** - Use canvas recording + audio merge
3. **Custom themes** - Color schemes, fonts
4. **Slide templates** - Different visual layouts
5. **Real-time collaboration** - WebSocket + CRDT
6. **Image generation** - Add DALL-E/Midjourney visuals
7. **Presentation sharing** - Generate shareable links
8. **Offline mode** - Service worker + cached generation
