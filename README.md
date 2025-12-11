# Narrator

Transform any text into AI-narrated presentations with natural voice synthesis.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![React](https://img.shields.io/badge/React-19-61dafb)

## Features

- **AI-Powered Slide Generation** - Claude or GPT-4 structures your content into presentation slides
- **Natural Voice Synthesis** - OpenAI TTS with 6 voice options (Alloy, Nova, Shimmer, Echo, Onyx, Fable)
- **Full Slide Editing** - Add, remove, and reorder slides with drag-and-drop
- **Bullet Management** - Add and remove bullet points per slide
- **Presentation Viewer** - Full-screen presentation with auto-advance and keyboard navigation
- **Progressive Degradation** - Works in demo mode without API keys
- **Accessible by Default** - Built on Radix UI primitives for WCAG compliance
- **Fully Tested** - 64 unit tests covering store actions and components

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 16 (App Router)      |
| Language   | TypeScript 5                 |
| Styling    | Tailwind CSS 4.0             |
| Components | ShadCN/UI (Radix primitives) |
| State      | Zustand                      |
| Animations | Framer Motion                |
| Drag & Drop| @dnd-kit                     |
| Testing    | Vitest + React Testing Library |
| AI         | Claude API, OpenAI API       |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-slides/    # Claude/GPT-4 slide generation
│   │   └── generate-audio/     # OpenAI TTS
│   ├── layout.tsx              # Root layout with Toaster
│   └── page.tsx                # Main SPA entry
├── components/
│   ├── ui/                     # ShadCN components
│   ├── input-state/            # Content input, style selector
│   ├── preview-state/          # Slide editor, voice selector
│   ├── viewer-state/           # Presentation playback
│   └── states/                 # State wrapper components
└── lib/
    ├── types.ts                # TypeScript definitions
    ├── store.ts                # Zustand state management
    └── hooks/                  # Custom React hooks
```

## Application States

```
┌─────────────┐      Generate      ┌─────────────┐      Present      ┌─────────────┐
│   INPUT     │ ───────────────▶  │   PREVIEW   │ ───────────────▶  │   VIEWER    │
│             │                    │             │                    │             │
│ • Content   │                    │ • Edit      │                    │ • Playback  │
│ • Style     │                    │ • Voice     │                    │ • Navigate  │
│ • Examples  │     ◀───────────── │ • Cards     │     ◀───────────── │ • Script    │
└─────────────┘        Back        └─────────────┘        Exit        └─────────────┘
```

## Keyboard Shortcuts (Viewer)

| Key      | Action           |
| -------- | ---------------- |
| `←`      | Previous slide   |
| `→`      | Next slide       |
| `Space`  | Play/Pause audio |
| `Escape` | Exit to preview  |

## Environment Variables

| Variable            | Required | Description                                  |
| ------------------- | -------- | -------------------------------------------- |
| `ANTHROPIC_API_KEY` | One of   | Claude API for slide generation (preferred)  |
| `OPENAI_API_KEY`    | Either   | OpenAI for TTS and fallback slide generation |

## Deployment

Deploy to Netlify or Vercel:

```bash
npm run build
```

Set environment variables in your hosting dashboard:
- `ANTHROPIC_API_KEY` - For Claude slide generation
- `OPENAI_API_KEY` - For TTS and fallback slide generation

## Testing

```bash
npm run test        # Watch mode
npm run test:run    # Single run
```

## License

MIT
