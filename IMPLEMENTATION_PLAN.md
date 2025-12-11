# Narrator UX Implementation Plan

> A phased guide to implementing UX improvements identified in UX_AUDIT.md
> Target audience: Junior-to-mid frontend engineer
> Estimated scope: 6 phases, each independently deployable

---

## Overview

This plan transforms Narrator from a functional prototype into a polished portfolio piece. The work is organized into phases that:

1. Start with quick wins to build momentum
2. Establish foundational architecture before building on it
3. Keep each phase small enough to complete and deploy independently
4. Prioritize user-facing impact over internal refactoring

**Key files you'll be working with:**

```
src/
├── components/
│   ├── states/input-state.tsx      ← Home page (Phase 2 focus)
│   ├── saved-presentations.tsx     ← Library content (Phase 3)
│   ├── export-import/
│   │   ├── import-zone.tsx         ← Import tab content
│   │   └── import-dialog.tsx       ← Phase 1 label fixes
│   └── viewer-state/
│       ├── playback-controls.tsx   ← Phase 5 focus
│       └── slide-navigation.tsx    ← Phase 5 focus
└── lib/
    ├── store.ts                    ← State management
    └── settings.ts                 ← User preferences
```

---

## Phase 1: Quick Wins

**Goal:** Ship visible improvements immediately while learning the codebase.

**Why this matters:** Quick wins build confidence and demonstrate progress to stakeholders. These changes also establish the vocabulary consistency that makes later work cleaner.

### Task 1.1: Button Label Standardization

**File:** `src/components/export-import/import-dialog.tsx`

**Current state:**
- Line ~73: Button says "View Presentation"
- Line ~69: Button says "Edit First"

**Change to:**
- "View Presentation" → "Present Now" (matches vocabulary from preview-header.tsx)
- "Edit First" → "Open for Editing" (matches "Open" action elsewhere)

**Why:** Users see "Present" in the preview header, so seeing "View Presentation" in the import dialog is confusing. Consistent vocabulary reduces cognitive load.

**Acceptance criteria:**
- [ ] Import dialog shows "Present Now" for direct presentation
- [ ] Import dialog shows "Open for Editing" for edit-first flow
- [ ] Icons remain appropriate (Play for Present, Pencil/FolderOpen for Edit)

### Task 1.2: Reduced Motion Support

**Files:**
- `src/components/viewer-state/slide-display.tsx`
- `src/components/viewer-state/viewer-intro.tsx`

**What to do:**

1. Create a hook or utility to detect `prefers-reduced-motion`:

```tsx
// Option A: CSS media query (simplest)
// In your Tailwind/CSS, use motion-safe: and motion-reduce: variants

// Option B: React hook
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

2. Wrap Framer Motion animations to respect this preference:
   - Skip or reduce `transition` durations
   - Disable auto-playing animations
   - Keep essential state changes (opacity for visibility) but remove decorative motion

**Why:** Accessibility isn't optional. Users with vestibular disorders or motion sensitivity can experience nausea from animations. This is also a portfolio differentiator—most junior projects ignore this.

**Acceptance criteria:**
- [ ] With `prefers-reduced-motion: reduce` enabled in OS settings, slide transitions are instant or very fast
- [ ] Intro animation on viewer-intro.tsx respects preference
- [ ] No console warnings about reduced motion

### Task 1.3: Auto-Advance Default

**File:** `src/lib/settings.ts`

**Current state:** Auto-advance likely defaults to `true`

**Change to:** Default to `false`

**Why:** Auto-advance is convenient for presenters who want hands-free playback, but it's surprising for first-time users. Defaults should be the least surprising option. Users who want auto-advance will find and enable it.

**Acceptance criteria:**
- [ ] New users see auto-advance unchecked by default
- [ ] Existing users who enabled it keep their preference (localStorage)
- [ ] Setting persists across sessions

---

## Phase 2: Tabs Architecture

**Goal:** Restructure the home page into three tabs: Create, Library, Import.

**Why this matters:** This is the highest-impact architectural change. It elevates Library and Import from "afterthoughts" to first-class entry points. Every polished creative tool (Figma, Notion, Canva) uses this pattern.

### Task 2.1: Create Tab Component

**New file:** `src/components/home-tabs.tsx` (or similar)

Create a simple tab component. You can use:
- Radix UI Tabs (already in the project via shadcn)
- Or build a minimal one with buttons + conditional rendering

```tsx
// Suggested structure
type TabId = 'create' | 'library' | 'import'

interface HomeTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  libraryCount: number  // For badge on Library tab
}
```

**Visual reference (from UX_AUDIT.md Appendix A):**
```
┌───────────────────────────────────────────────────────────────┐
│  [  ✨ Create  ]  [  📚 Library (3)  ]  [  📥 Import  ]       │
└───────────────────────────────────────────────────────────────┘
```

**Styling notes:**
- Active tab should have visual distinction (underline, background, or both)
- Library tab shows count badge when `libraryCount > 0`
- Tabs should be keyboard navigable (arrow keys)

**Acceptance criteria:**
- [ ] Three tabs render horizontally
- [ ] Clicking a tab changes active state
- [ ] Active tab is visually distinct
- [ ] Library badge shows count (or hides when 0)

### Task 2.2: Refactor InputState to Use Tabs

**File:** `src/components/states/input-state.tsx`

**Current structure:**
```tsx
<Card>
  <CardContent>
    {/* Header */}
    {/* ContentInput */}
    {/* StyleSelector */}
    {/* ExampleButtons */}
    {/* GenerateButton */}
    {/* SavedPresentations */}  ← Move to Library tab
    {/* ImportZone */}          ← Move to Import tab
  </CardContent>
</Card>
```

**New structure:**
```tsx
<div>
  {/* Header (always visible) */}
  <HomeTabs activeTab={activeTab} onTabChange={setActiveTab} libraryCount={...} />

  {activeTab === 'create' && (
    <Card>
      {/* ContentInput, StyleSelector, ExampleButtons, GenerateButton */}
    </Card>
  )}

  {activeTab === 'library' && (
    <LibraryTab />  // SavedPresentations, moved here
  )}

  {activeTab === 'import' && (
    <ImportTab />   // ImportZone, moved here
  )}
</div>
```

**State management:**
- Add `activeTab` to component state (useState)
- Later (Phase 4) this will sync with URL hash

**Acceptance criteria:**
- [ ] Create tab shows the content input form (current default view)
- [ ] Library tab shows saved presentations
- [ ] Import tab shows the import drop zone
- [ ] Switching tabs is instant (no page reload)
- [ ] No visual regressions in any tab's content

### Task 2.3: Create Tab Content Cleanup

**File:** The Create tab content (wherever you put it after refactor)

Remove the "Or load a saved presentation" and "Or import from file" dividers. The Create tab should only contain:
- Content textarea (with question-style label: "What do you want to present?")
- Style selector
- Example buttons
- Generate button

**Why:** Each tab now has a single purpose. Users on the Create tab are creating—they don't need to see Library or Import options.

**Acceptance criteria:**
- [ ] Create tab has no "Or..." dividers
- [ ] Create tab content fits above the fold on typical screens
- [ ] Label above textarea is more conversational (optional: "What do you want to present?")

---

## Phase 3: Library Enhancement

**Goal:** Make the Library tab visually impressive with a card grid layout.

**Why this matters:** The Library tab is where returning users land. A polished grid layout (like Figma's file browser) signals "this is a real product" more than any other single change.

### Task 3.1: Empty State

**File:** Create new component or modify `saved-presentations.tsx`

When `savedPresentations.length === 0`, show a friendly empty state instead of nothing:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        📚                                     │
│                                                               │
│              No presentations yet                             │
│                                                               │
│       Create your first presentation or import an             │
│       existing .narrator file to get started.                 │
│                                                               │
│       [Create New]         [Import File]                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Button actions:**
- "Create New" → switch to Create tab
- "Import File" → switch to Import tab

**Why:** Empty states are a UX fundamental. They guide new users instead of showing a blank void. They also demonstrate attention to detail in portfolio reviews.

**Acceptance criteria:**
- [ ] Empty state shows when no presentations saved
- [ ] Buttons navigate to appropriate tabs
- [ ] Empty state is vertically centered and visually balanced

### Task 3.2: Grid Layout for Presentation Cards

**File:** `src/components/saved-presentations.tsx` (or new Library component)

**Current:** Vertical list of cards

**Target:** Responsive grid of cards

```tsx
// Suggested Tailwind classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {presentations.map(p => <PresentationCard key={p.id} {...p} />)}
</div>
```

**Card design updates:**
- Make cards more visual (consider showing title slide preview as thumbnail)
- Add hover state: subtle lift effect (`hover:shadow-lg transition-shadow`)
- Move Export/Delete into a "..." dropdown menu to reduce visual clutter

**Visual reference (from UX_AUDIT.md):**
```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 📄             │  │ 📄             │  │ 📄             │
│                │  │                │  │                │
│ Q3 Sales Pitch │  │ Product Demo   │  │ Team Standup   │
│ 8 slides • 2d  │  │ 5 slides • 1w  │  │ 4 slides • 1w  │
│ [Open] [···]   │  │ [Open] [···]   │  │ [Open] [···]   │
└────────────────┘  └────────────────┘  └────────────────┘
```

**Acceptance criteria:**
- [ ] Grid displays 1 column on mobile, 2 on tablet, 3 on desktop
- [ ] Cards have consistent height (consider aspect ratio or fixed height)
- [ ] Hover state provides visual feedback
- [ ] Open button is primary action, other actions in dropdown

### Task 3.3: Dropdown Menu for Card Actions

**File:** Presentation card component

Replace the inline Export and Delete buttons with a dropdown menu:

```tsx
// Using Radix DropdownMenu (via shadcn)
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" /> Export
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Why:** Grid layouts work best when cards are visually similar. Hiding secondary actions in a dropdown keeps cards clean and draws attention to the primary "Open" action.

**Acceptance criteria:**
- [ ] "..." button opens dropdown menu
- [ ] Export and Delete options in dropdown
- [ ] Delete still requires confirmation (double-click or separate confirm)
- [ ] Dropdown closes when action is taken or clicked outside

---

## Phase 4: URL Routing

**Goal:** Make browser navigation (back/forward) work and enable bookmarking.

**Why this matters:** Real applications support browser navigation. Without it, users lose work when they accidentally hit back. This is table-stakes for production apps and notable in portfolio pieces.

### Task 4.1: Hash-Based Tab Routing

**Implementation approach:**

1. Define routes:
```
/#/           → Create tab (or Library if returning user)
/#/library    → Library tab
/#/import     → Import tab
/#/preview    → Preview state (existing)
/#/present    → Viewer state (existing)
```

2. On component mount, read `window.location.hash` and set initial tab

3. When tab changes, update hash with `window.history.pushState()`

4. Listen to `popstate` event to handle back/forward buttons

```tsx
// Pseudocode
useEffect(() => {
  const handlePopState = () => {
    const hash = window.location.hash
    const tab = hashToTab(hash)  // Parse hash to tab ID
    setActiveTab(tab)
  }

  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])

const handleTabChange = (tab: TabId) => {
  setActiveTab(tab)
  window.history.pushState(null, '', `/#/${tab}`)
}
```

**Acceptance criteria:**
- [ ] Changing tabs updates URL hash
- [ ] Refreshing page preserves tab selection
- [ ] Browser back button returns to previous tab
- [ ] Direct navigation to `/#/library` opens Library tab

### Task 4.2: First-Run Detection

**File:** `src/lib/settings.ts` or new utility

Detect whether user is new or returning:

```tsx
const isReturningUser = () => {
  // Option 1: Check if they have saved presentations
  const savedPresentations = useNarratorStore.getState().savedPresentations
  return savedPresentations.length > 0

  // Option 2: Explicit flag in localStorage
  // return localStorage.getItem('narrator_has_visited') === 'true'
}
```

Use this to determine default tab when no hash is present:
- New users → Create tab
- Returning users → Library tab

**Why:** Returning users care about their saved work. Showing them the Library immediately (like Figma does) respects their time.

**Acceptance criteria:**
- [ ] New users land on Create tab by default
- [ ] Users with saved presentations land on Library tab
- [ ] Explicit URL hash overrides default (e.g., `/#/create` always goes to Create)

### Task 4.3: Extend Routing to App States

**File:** `src/lib/store.ts` (and components that call `setAppState`)

Currently, `appState` changes between 'input', 'preview', and 'viewer' without updating URL.

Add URL updates when app state changes:
- `setAppState('preview')` → push `/#/preview`
- `setAppState('viewer')` → push `/#/present`
- Going back to input → push `/#/` (or `/#/library`)

**Why:** If a user is in the viewer and hits browser back, they should return to preview—not leave the site entirely.

**Acceptance criteria:**
- [ ] Entering preview updates URL to `/#/preview`
- [ ] Entering viewer updates URL to `/#/present`
- [ ] Browser back from viewer goes to preview
- [ ] Browser back from preview goes to input (appropriate tab)

---

## Phase 5: Viewer Controls Overhaul

**Goal:** Redistribute viewer controls for clarity and follow YouTube/Netflix patterns.

**Why this matters:** The viewer is the "product" users present to their audience. Cluttered controls make the app feel amateur. Clean controls make presenters look professional.

### Task 5.1: Control Bar Layout

**Files:**
- `src/components/viewer-state/playback-controls.tsx`
- `src/components/viewer-state/slide-navigation.tsx`
- `src/components/states/viewer-state.tsx`

**Current layout:** All controls stacked in top-left

**Target layout:**
```
┌──────────────────────────────────────────────────────┐
│ [X Exit]        ═══════════════════════       1 / 6  │
│                      (progress bar)                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│                  Slide Content                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [◀] [▶❙❙] [⚙️ Settings] [📜 Script]            [▶]  │
└──────────────────────────────────────────────────────┘
```

**Key changes:**
1. Move Exit to top-left (always visible)
2. Add progress bar at top
3. Create bottom control bar with:
   - Navigation (previous/next)
   - Play/pause
   - Settings button (opens flyout)
   - Script button (opens panel)
4. Remove inline sliders (move to Settings flyout)

**Acceptance criteria:**
- [ ] Exit button in top-left corner
- [ ] Progress bar shows current slide position
- [ ] Bottom bar contains all playback controls
- [ ] Controls are horizontally arranged, not stacked

### Task 5.2: Settings Flyout

**New component:** Settings popover/flyout

Consolidate these controls into a settings flyout:
- Playback speed slider
- Volume slider
- Auto-advance toggle

Use Radix Popover (via shadcn) or similar:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-64">
    {/* Speed slider */}
    {/* Volume slider */}
    {/* Auto-advance checkbox */}
  </PopoverContent>
</Popover>
```

**Why:** Progressive disclosure. Most users never touch speed/volume, so hiding them reduces visual clutter for the majority while keeping them accessible for power users.

**Acceptance criteria:**
- [ ] Settings button opens flyout/popover
- [ ] Flyout contains speed, volume, auto-advance
- [ ] Changes apply immediately (no "save" button needed)
- [ ] Flyout closes when clicking outside

### Task 5.3: Auto-Hide Controls (Stretch Goal)

**Enhancement:** Hide controls after 3 seconds of inactivity, show on mouse movement.

```tsx
const [controlsVisible, setControlsVisible] = useState(true)
const timeoutRef = useRef<NodeJS.Timeout>()

const showControls = () => {
  setControlsVisible(true)
  clearTimeout(timeoutRef.current)
  timeoutRef.current = setTimeout(() => setControlsVisible(false), 3000)
}

useEffect(() => {
  window.addEventListener('mousemove', showControls)
  return () => window.removeEventListener('mousemove', showControls)
}, [])
```

**Why:** Full-screen presentations look better without visible controls. This is the YouTube/Netflix pattern.

**Acceptance criteria:**
- [ ] Controls fade out after 3 seconds of no mouse movement
- [ ] Moving mouse shows controls
- [ ] Controls stay visible while interacting with them
- [ ] Keyboard shortcuts still work when controls hidden

---

## Phase 6: Polish & Accessibility

**Goal:** Add finishing touches that distinguish senior-level work.

**Why this matters:** These details separate "works" from "polished." Portfolio reviewers notice.

### Task 6.1: Tab Transitions

**File:** Home tabs component

Add Framer Motion transitions between tab content:

```tsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.15 }}
  >
    {/* Tab content */}
  </motion.div>
</AnimatePresence>
```

**Important:** Respect `prefers-reduced-motion` (from Phase 1).

**Acceptance criteria:**
- [ ] Tab content fades in/out on switch
- [ ] Animation is subtle (150-200ms)
- [ ] Reduced motion users see instant switch

### Task 6.2: Skeleton Loading

**File:** Library tab

If IndexedDB load is slow, show skeleton cards:

```tsx
// shadcn has a Skeleton component
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {isLoading ? (
    <>
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </>
  ) : (
    presentations.map(p => <PresentationCard key={p.id} {...p} />)
  )}
</div>
```

**Why:** Skeleton loading is a modern pattern that indicates content is coming. It feels faster than a spinner.

**Acceptance criteria:**
- [ ] Skeleton cards show while presentations load
- [ ] Skeleton matches card dimensions
- [ ] Transition from skeleton to real content is smooth

### Task 6.3: Keyboard Navigation

Ensure full keyboard accessibility:

**Tabs:**
- Tab key focuses tab bar
- Arrow keys move between tabs
- Enter/Space activates tab

**Library cards:**
- Tab key moves through cards
- Enter opens focused card
- Visible focus ring on all interactive elements

**Test with:**
1. Unplug your mouse and use only keyboard
2. Turn on screen reader (macOS: Cmd+F5) and verify announcements

**Acceptance criteria:**
- [ ] All interactive elements reachable via Tab key
- [ ] Visible focus indicators on all elements
- [ ] Logical tab order (left-to-right, top-to-bottom)

### Task 6.4: Export Button Text

**File:** `src/components/export-import/export-button.tsx`

Currently icon-only. Add visible text:

```tsx
<Button size="sm" variant="outline">
  <Download className="mr-1 h-4 w-4" />
  Export
</Button>
```

Or in the dropdown menu version (Phase 3), ensure "Export" text is always visible.

**Why:** Icon-only buttons require users to guess or hover. Visible text removes ambiguity.

**Acceptance criteria:**
- [ ] Export action has visible text label
- [ ] Screen readers announce "Export" (already has sr-only, but visible is better)

---

## Appendix: Testing Checklist

Before marking any phase complete, verify:

### Functional Testing
- [ ] All existing tests pass (`npm run test`)
- [ ] New functionality works in Chrome, Firefox, Safari
- [ ] Mobile responsive (test at 375px, 768px, 1024px widths)
- [ ] No console errors or warnings

### Accessibility Testing
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces interactive elements correctly
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible

### User Flow Testing
- [ ] New user can create presentation (Create → Preview → Viewer)
- [ ] Returning user can open saved presentation (Library → Preview)
- [ ] Recipient can import file (Import → Dialog → Preview or Viewer)
- [ ] Browser back/forward works throughout

---

## Appendix: File Quick Reference

| Feature | Primary File(s) |
|---------|-----------------|
| Home page tabs | `src/components/states/input-state.tsx` |
| Saved presentations | `src/components/saved-presentations.tsx` |
| Import zone | `src/components/export-import/import-zone.tsx` |
| Import dialog | `src/components/export-import/import-dialog.tsx` |
| Viewer controls | `src/components/viewer-state/playback-controls.tsx` |
| Slide navigation | `src/components/viewer-state/slide-navigation.tsx` |
| App state | `src/lib/store.ts` |
| User settings | `src/lib/settings.ts` |

---

## Summary: Recommended Order

| Phase | Focus | Effort | Impact |
|-------|-------|--------|--------|
| 1 | Quick Wins | Low | Medium |
| 2 | Tabs Architecture | Medium | High |
| 3 | Library Enhancement | Medium | High |
| 4 | URL Routing | Medium | Medium |
| 5 | Viewer Controls | Medium | High |
| 6 | Polish | Low | Medium |

**Recommended approach:** Complete phases sequentially. Each phase is deployable independently, so you can ship improvements incrementally rather than waiting for everything.

Phase 2 (Tabs) is the architectural foundation. Don't skip to Phase 3-4 until tabs are solid.

Phase 5 (Viewer) is somewhat independent—if you have a second engineer, they could work on this in parallel with Phase 3-4.
