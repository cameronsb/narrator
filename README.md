# Narrator V2

Transform any text into AI-narrated presentations with natural voice synthesis.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Radix UI](https://img.shields.io/badge/Radix_UI-Accessible-purple)

## Features

- **AI-Powered Slide Generation** - Claude or GPT-4 structures your content into presentation slides
- **Natural Voice Synthesis** - OpenAI TTS with 6 voice options (Alloy, Nova, Shimmer, Echo, Onyx, Fable)
- **Editable Preview** - Review and modify slides before generating audio
- **Presentation Viewer** - Full-screen presentation with auto-advance and keyboard navigation
- **Progressive Degradation** - Works in demo mode without API keys
- **Accessible by Default** - Built on Radix UI primitives for WCAG compliance

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 14 (App Router)      |
| Language   | TypeScript                   |
| Styling    | Tailwind CSS 4.0             |
| Components | ShadCN/UI (Radix primitives) |
| State      | Zustand                      |
| Animations | Framer Motion                |
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

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/narrator-v2&env=ANTHROPIC_API_KEY,OPENAI_API_KEY)

Or manually:

```bash
npm run build
npm run start
```

## V1 vs V2 Comparison

| Aspect        | V1 (Vanilla)                | V2 (Modern)              |
| ------------- | --------------------------- | ------------------------ |
| Architecture  | 1525 lines in one HTML file | Component-based modules  |
| Accessibility | DIY (broken)                | Radix UI primitives      |
| Type Safety   | None                        | Full TypeScript          |
| State         | Global `App` object         | Zustand store            |
| Styling       | Hand-rolled CSS             | Tailwind + design tokens |
| Testing       | None                        | Ready for Jest/Vitest    |

## License

MIT
