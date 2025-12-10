// Presentation styles
export const STYLES = ['narrative', 'minimal', 'educational', 'creative'] as const
export type Style = (typeof STYLES)[number]

export const STYLE_CONFIG: Record<Style, { label: string; description: string }> = {
  narrative: { label: 'Narrative', description: 'Story-driven, persuasive flow' },
  minimal: { label: 'Minimal', description: 'Clean, factual presentation' },
  educational: { label: 'Educational', description: 'Learning-focused with examples' },
  creative: { label: 'Creative', description: 'Thought-provoking and inspiring' },
}

// Voice options
export const VOICES = ['alloy', 'nova', 'shimmer', 'echo', 'onyx', 'fable'] as const
export type Voice = (typeof VOICES)[number]

export const VOICE_CONFIG: Record<Voice, { label: string; description: string }> = {
  alloy: { label: 'Alloy', description: 'Neutral and balanced' },
  nova: { label: 'Nova', description: 'Warm and engaging' },
  shimmer: { label: 'Shimmer', description: 'Clear and expressive' },
  echo: { label: 'Echo', description: 'Soft and calm' },
  onyx: { label: 'Onyx', description: 'Deep and authoritative' },
  fable: { label: 'Fable', description: 'British and narrative' },
}

// Slide data structures
export interface Slide {
  title: string
  points: string[]
  script: string
}

export interface PresentationMetadata {
  title: string
  subtitle: string
  titleScript: string
}

export interface PresentationData {
  metadata: PresentationMetadata
  slides: Slide[]
}

// App state
export type AppState = 'input' | 'preview' | 'viewer'

// Example content
export const EXAMPLES = {
  startup: `Our startup, EcoTrack, is revolutionizing how businesses measure their carbon footprint.

The Problem: Companies waste thousands of hours annually on manual sustainability reporting. Current tools are fragmented, expensive, and require specialized consultants.

Our Solution: EcoTrack provides real-time carbon tracking that integrates with existing business tools. One dashboard, automated reports, actionable insights.

Key Features:
- Automatic data collection from 200+ business tools
- AI-powered recommendations to reduce emissions
- One-click compliance reports for all major frameworks
- 73% time savings vs manual tracking

Traction: We've onboarded 45 enterprise customers in 6 months, including 3 Fortune 500 companies. $2.1M ARR growing 40% month-over-month.

The Ask: We're raising $5M Series A to expand our sales team and build out our AI recommendations engine.`,

  quarterly: `Q3 2024 Engineering Team Update

Highlights:
- Shipped 3 major features ahead of schedule
- Reduced page load time by 45%
- Zero critical incidents for 90 days straight
- Team grew from 8 to 12 engineers

Key Deliverables:
1. New checkout flow - 23% conversion improvement
2. Mobile app v2.0 launch - 4.8 star rating
3. API v3 migration complete - 99.99% uptime

Challenges:
- Technical debt in payment system needs attention
- Hiring senior engineers remains competitive
- Some scope creep on the mobile project

Q4 Priorities:
- Payment system refactor (reduce incidents by 50%)
- Launch recommendation engine MVP
- Improve developer onboarding (target: productive in 2 weeks)

Team Health: Engagement score improved from 7.2 to 8.1. Two promotions this quarter.`,

  tutorial: `Building Your First REST API with Node.js

Today we'll create a complete REST API from scratch. By the end, you'll have a working API with CRUD operations, validation, and error handling.

Prerequisites:
- Node.js installed (v18+)
- Basic JavaScript knowledge
- A code editor

Step 1: Project Setup
Initialize your project with npm init and install Express, our web framework. Express handles routing and HTTP for us.

Step 2: Create Your Server
Set up a basic Express server that listens on port 3000. We'll add middleware for JSON parsing.

Step 3: Define Routes
Create endpoints for GET, POST, PUT, and DELETE operations. Each maps to a specific action on our resources.

Step 4: Add Validation
Never trust user input. We'll use Joi to validate request bodies and return helpful error messages.

Step 5: Error Handling
Create a centralized error handler that catches exceptions and returns consistent error responses.

Best Practices:
- Use environment variables for configuration
- Add request logging for debugging
- Version your API (/api/v1/)
- Write tests for critical paths

Next steps: Deploy to a cloud provider and add authentication.`,
} as const

export type ExampleKey = keyof typeof EXAMPLES
