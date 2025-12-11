# Integration Plan: Teacher-Bot Features into Narrator

This document outlines a strategy for integrating key features from the `teacher-bot` project into the `narrator` app, focusing on **enhanced prompts for slide creation** and **Wikipedia integration**.

---

## Executive Summary

The teacher-bot project has two features that would significantly enhance narrator:

1. **Sophisticated prompt engineering** with modular structure, configurable detail levels, explicit rules for content/scripting/alignment, and [PAUSE] markers for natural speech
2. **Wikipedia integration** allowing users to search and select articles as source material, complete with image extraction

These features would transform narrator from a "paste your text" tool into a more powerful content creation platform.

---

## Part 1: Enhanced Prompt System

### Current State (Narrator)

Narrator's current prompt (`src/app/api/generate-slides/route.ts`) is relatively simple:

```
Transform this content into a presentation slideshow.
CONTENT: [text]
STYLE: [style]
[style-specific instructions]
Output ONLY valid JSON...
Guidelines:
- Create 5-10 slides depending on content depth
- Each slide should have 2-4 bullet points
- Scripts should be natural, conversational text
```

**Limitations:**

- No guidance on narrative flow between slides
- No pacing markers for natural speech
- No validation/alignment checks
- Single flat structure (no modules/sections)
- No image support in output schema

### Teacher-Bot's Approach

Teacher-bot uses a layered prompt system with explicit rules:

| Rule Category    | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| Content Rules    | Maintain hierarchy, match objectives to content, expand scripts 30-50%      |
| Scripting Rules  | [PAUSE] markers every 40-60 words, clear transitions, never repeat verbatim |
| Alignment Rules  | Title/agenda consistency, script promises = slide reality                   |
| Transition Rules | Context between bullets, maintain numbering                                 |
| Image Guidelines | Structured image slide format with captions                                 |

### Recommended Integration

#### Phase 1: Enhance Prompt Structure

**File:** `src/app/api/generate-slides/route.ts`

Add configurable detail levels:

```typescript
const DETAIL_LEVELS = {
  concise: {
    description: '3-5 key concepts with minimal examples',
    slideCount: '4-6',
    pointsPerSlide: '2-3',
  },
  balanced: {
    description: '5-7 core ideas with practical applications',
    slideCount: '6-8',
    pointsPerSlide: '3-4',
  },
  immersive: {
    description: '8-10 detailed sections with case studies',
    slideCount: '8-12',
    pointsPerSlide: '3-5',
  },
}
```

Add scripting rules to the prompt:

```typescript
const SCRIPTING_RULES = `
NARRATIVE FLOW REQUIREMENTS:
- Title Script: Welcome message introducing the presentation topic
- Each slide script should naturally transition from the previous
- Include [PAUSE] markers every 40-60 words for natural pacing
- Scripts should EXPAND on bullet points (30-50% new context)
- Never repeat slide text verbatim in the script
- Use clear sentence boundaries for variable speed playback
`
```

#### Phase 2: Add [PAUSE] Marker Support

**Files to modify:**

- `src/app/api/generate-audio/route.ts` - Strip [PAUSE] markers, insert SSML or silence
- `src/lib/types.ts` - Document the marker convention

The [PAUSE] markers serve two purposes:

1. Guide the AI to write more naturally-paced scripts
2. Can be converted to actual pauses in TTS (via SSML `<break>` tags if supported, or by splitting audio generation)

**Implementation option:** Convert `[PAUSE]` to periods or ellipses before TTS, or split scripts at pause points and concatenate audio with brief silence.

#### Phase 3: Modular Structure (Optional)

Teacher-bot organizes content into modules, each with:

- Title
- Objective
- Transition script
- Slides[]
- Resources

This could be valuable for longer presentations. Consider adding an optional "structured" mode that generates module-based output for content over a certain length.

### Updated Output Schema

```typescript
const OUTPUT_SCHEMA = `{
  "metadata": {
    "title": "Presentation title (max 80 chars)",
    "subtitle": "Descriptive subtitle (max 120 chars)",
    "titleScript": "Welcome script with [PAUSE] markers (30-60 seconds)"
  },
  "slides": [
    {
      "title": "Slide title (max 50 chars)",
      "points": ["Key point 1", "Key point 2", "Key point 3"],
      "script": "Narration with [PAUSE] markers expanding on points...",
      "image": {  // Optional
        "url": "image_url",
        "caption": "Image description"
      }
    }
  ]
}`
```

---

## Part 2: Wikipedia Integration

### Teacher-Bot's Implementation

Teacher-bot provides:

1. **Search endpoint** - Debounced search returning title + snippet
2. **Article endpoint** - Full content, summary, images, URL
3. **Client UI** - Search input, results list, article preview with image gallery
4. **Content processing** - Removes references, citations, excluded sections

### Recommended Integration for Narrator

#### Architecture

```
src/
├── app/api/wikipedia/
│   ├── search/route.ts      # GET /api/wikipedia/search?q=...
│   └── article/route.ts     # GET /api/wikipedia/article?title=...
├── lib/
│   └── wikipedia.ts         # Wikipedia service class
└── components/
    └── input-state/
        ├── wikipedia-search.tsx    # Search input + results
        └── article-preview.tsx     # Selected article display
```

#### Wikipedia Service

**File:** `src/lib/wikipedia.ts`

```typescript
// Key methods to implement:
class WikipediaService {
  // Search Wikipedia, return titles + snippets
  async search(query: string, limit?: number): Promise<SearchResult[]>

  // Fetch full article with processed content and images
  async getArticle(title: string): Promise<Article>

  // Clean content: remove refs, citations, excluded sections
  private processContent(raw: string): string

  // Extract usable images (filter SVG, limit count)
  private extractImages(page: WikiPage): Image[]
}
```

**Key processing from teacher-bot to adopt:**

- Remove sections: References, External links, See also, Notes, Bibliography
- Strip `[1]`, `[2]` reference markers
- Remove `[citation needed]` tags
- Clean pronunciation guides from summaries
- Limit to ~9 images, filter to JPG/PNG/GIF only

#### UI Components

**1. Wikipedia Search (`src/components/input-state/wikipedia-search.tsx`)**

Features:

- Search input with 300ms debounce
- Loading state while searching
- Results list with title + snippet
- Click to select and preview

```tsx
// Simplified structure
<div className="space-y-4">
  <div className="relative">
    <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
    <Input placeholder="Search Wikipedia..." onChange={handleSearch} className="pl-9" />
  </div>

  {isSearching && <LoadingSpinner />}

  {results.map((result) => (
    <SearchResultCard
      key={result.title}
      title={result.title}
      snippet={result.snippet}
      onClick={() => selectArticle(result.title)}
    />
  ))}
</div>
```

**2. Article Preview (`src/components/input-state/article-preview.tsx`)**

Features:

- Article title and summary
- Image gallery (horizontal scroll or grid)
- "Use this article" button to populate content
- "View on Wikipedia" external link

```tsx
<Card>
  <CardHeader>
    <CardTitle>{article.title}</CardTitle>
    <Button variant="ghost" size="sm" asChild>
      <a href={article.url} target="_blank">
        View on Wikipedia
      </a>
    </Button>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">{article.summary}</p>

    {article.images.length > 0 && (
      <div className="flex gap-2 overflow-x-auto py-4">
        {article.images.map((img) => (
          <img key={img.url} src={img.url} alt={img.caption} />
        ))}
      </div>
    )}

    <Button onClick={() => useArticle(article)}>Use This Article</Button>
  </CardContent>
</Card>
```

#### Store Integration

**File:** `src/lib/store.ts`

Add state for Wikipedia:

```typescript
interface NarratorStore {
  // ... existing state

  // Wikipedia state
  selectedArticle: WikiArticle | null
  setSelectedArticle: (article: WikiArticle | null) => void
}
```

When "Use This Article" is clicked:

1. Set `content` to `article.summary` (or full processed content)
2. Store `selectedArticle` for passing images to generation
3. Clear Wikipedia search UI

#### Generation Integration

**File:** `src/app/api/generate-slides/route.ts`

When `selectedArticle` data is provided:

```typescript
function buildPrompt(text: string, style: Style, articleData?: ArticleData) {
  let prompt = `Transform this content into a presentation...`

  if (articleData?.images?.length) {
    prompt += `\n\nAVAILABLE IMAGES:\n`
    articleData.images.forEach((img, i) => {
      prompt += `${i + 1}. URL: ${img.url}\n   Caption: ${img.caption}\n`
    })
    prompt += `\nIncorporate 2-4 of these images into appropriate slides using the image format.`
  }

  return prompt
}
```

---

## Part 3: UI/UX Considerations

### Input State Layout Update

The input state would need restructuring to accommodate Wikipedia search:

```
┌─────────────────────────────────────────┐
│              Narrator                   │
│   Transform text into AI presentations  │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Paste Text  │  │ Search Wikipedia │  │  <- Tab toggle
│  └─────────────┘  └─────────────────┘   │
├─────────────────────────────────────────┤
│                                         │
│  [Content area changes based on tab]    │
│                                         │
├─────────────────────────────────────────┤
│  Style: [Narrative] [Minimal] [...]     │
│  Detail: [Concise] [Balanced] [...]     │  <- New option
├─────────────────────────────────────────┤
│         [ Generate Presentation ]       │
└─────────────────────────────────────────┘
```

### Mobile Considerations

- Wikipedia image gallery should be horizontally scrollable
- Search results should be touch-friendly (larger tap targets)
- Consider collapsing article preview on small screens

---

## Part 4: Implementation Phases

### Phase 1: Enhanced Prompts (Low effort, High impact)

- [ ] Add detail level selector to UI
- [ ] Update prompt with scripting rules and [PAUSE] markers
- [ ] Update store with `detailLevel` state
- [ ] Test output quality improvements

**Estimated scope:** 2-3 files, ~200 lines

### Phase 2: [PAUSE] Processing (Medium effort)

- [ ] Process [PAUSE] markers in audio generation
- [ ] Option A: Convert to SSML breaks (if OpenAI TTS supports)
- [ ] Option B: Split scripts and concatenate with silence
- [ ] Test natural pacing in output

**Estimated scope:** 1-2 files, ~100 lines

### Phase 3: Wikipedia Integration (Higher effort)

- [ ] Create Wikipedia service with search + article fetching
- [ ] Create API routes
- [ ] Build search UI component
- [ ] Build article preview component
- [ ] Integrate with content input (tab or toggle)
- [ ] Pass article data to generation
- [ ] Handle images in output schema

**Estimated scope:** 6-8 new files, ~600-800 lines

### Phase 4: Image Support in Slides (Medium effort)

- [ ] Update slide renderer to handle image slides
- [ ] Update viewer to display images properly
- [ ] Update slide editor to show/edit image slides

**Estimated scope:** 3-4 files, ~200-300 lines

---

## Technical Notes

### Wikipedia API Package

Teacher-bot uses the `wikipedia` npm package (v2.1.2). This is a good choice:

- Simple API
- Handles rate limiting
- Returns structured data

```bash
npm install wikipedia
```

### Content Length Considerations

Wikipedia articles can be very long. Consider:

- Truncating to first N characters/paragraphs for prompt
- Showing full summary but truncated content
- Warning users if content exceeds reasonable limits

### Rate Limiting

Add rate limiting to Wikipedia endpoints to prevent abuse:

- 30 searches per minute per IP
- 10 article fetches per minute per IP

---

## Risks and Mitigations

| Risk                              | Mitigation                                              |
| --------------------------------- | ------------------------------------------------------- |
| Wikipedia API changes             | Use established npm package, add error handling         |
| Long articles exceed token limits | Truncate content, use summary for shorter presentations |
| Image URLs expire/break           | Cache images or accept transient nature                 |
| [PAUSE] markers in wrong places   | AI generally handles this well; could post-process      |
| Increased prompt complexity       | Test thoroughly, A/B test against current prompts       |

---

## Success Metrics

1. **Prompt improvements:** Scripts sound more natural when narrated
2. **Wikipedia integration:** Users can go from topic idea to presentation without leaving the app
3. **Overall:** Reduced time from "I want to present about X" to finished presentation

---

## Appendix: Key Files Reference

### Teacher-Bot Files to Study

| File                                      | Purpose                   |
| ----------------------------------------- | ------------------------- |
| `src/server/config/prompts.js`            | Complete prompt templates |
| `src/server/services/wikipediaService.js` | Wikipedia integration     |
| `src/client/js/app.js:1128-1263`          | Client-side Wikipedia UI  |

### Narrator Files to Modify

| File                                   | Changes                         |
| -------------------------------------- | ------------------------------- |
| `src/app/api/generate-slides/route.ts` | Enhanced prompts, detail levels |
| `src/lib/store.ts`                     | Detail level, article state     |
| `src/lib/types.ts`                     | New types for Wikipedia, images |
| `src/components/input-state/`          | New Wikipedia components        |
