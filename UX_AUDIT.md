# Narrator UX Audit

> Comprehensive analysis of user experience issues and recommendations
> Last updated: 2025-12-11

## Executive Summary

This audit identifies UX issues in the Narrator application stemming from incremental feature additions without holistic design review. The app has strong technical foundations, but the user experience suffers from inconsistent vocabulary, cluttered viewer controls, and presentation controls that feel bolted-on rather than integrated.

**Priority fixes (completed):**

- [x] Button cursor-pointer inconsistency
- [x] "Load" → "Open" with appropriate icon
- [x] "Watch" → "Present", always visible
- [x] Export button accessibility label
- [x] Script panel aria-describedby warning
- [x] Empty subtitle bullet rendering

**Remaining recommendations:**

- [ ] Viewer controls layout overhaul
- [ ] Information architecture (tabs)
- [ ] URL-based navigation
- [ ] Additional button label standardization

---

## 1. Button Labeling Inconsistency

### Problem

The Play icon (▶) is overloaded across 4 different actions, causing user confusion:

| Location                | Button        | Icon                  | Label                   | Actual Action                |
| ----------------------- | ------------- | --------------------- | ----------------------- | ---------------------------- |
| saved-presentations.tsx | Load saved    | ~~Play~~ → FolderOpen | ~~"Load"~~ → "Open"     | Opens in Preview (edit mode) |
| import-dialog.tsx       | View imported | Play                  | "View Presentation"     | Opens in Viewer              |
| import-dialog.tsx       | Edit imported | Pencil                | "Edit First"            | Opens in Preview             |
| preview-header.tsx      | Present       | Play                  | ~~"Watch"~~ → "Present" | Opens in Viewer              |
| viewer-intro.tsx        | Start         | Play                  | "Start Presentation"    | Begins playback              |

### Recommendation: Consistent Vocabulary

| Action Type            | Icon                      | Label            |
| ---------------------- | ------------------------- | ---------------- |
| **Open for editing**   | `FolderOpen`              | "Open" or "Edit" |
| **Start presentation** | `Play`                    | "Present"        |
| **Generate content**   | `Sparkles` or `RotateCcw` | "Generate"       |
| **Go back**            | `ArrowLeft`               | "Back to..."     |
| **Save**               | `Save`                    | "Save"           |
| **Download/Export**    | `Download`                | "Export"         |

### Remaining Changes

| File                 | Current             | Recommended        |
| -------------------- | ------------------- | ------------------ |
| import-dialog.tsx:73 | "View Presentation" | "Present Now"      |
| import-dialog.tsx:69 | "Edit First"        | "Open for Editing" |

---

## 2. Information Architecture

### Problem

Save/Load/Import appear as afterthoughts, buried below the primary CTA:

```
Current Layout:
1. Header
2. Content textarea
3. Style selector
4. Example buttons
5. Generate button      ← Primary CTA
6. Saved presentations  ← Below primary 🚩
7. Import zone          ← At bottom 🚩
```

### Recommendation: Tab-Based Entry Points

```
┌───────────────────────────────────────────────┐
│  [✏️ Create]  [📚 Library]  [📥 Import]       │
├───────────────────────────────────────────────┤
│                                               │
│   Content varies by selected tab              │
│                                               │
└───────────────────────────────────────────────┘
```

This distinguishes three user journeys:

1. **Create** — New presentations (current default flow)
2. **Library** — Returning users with saved work
3. **Import** — Recipients of shared .narrator files

---

## 3. Viewer Controls Layout

### Problem

All controls stacked vertically in top-left corner:

```
Current Layout:
┌──────────────────────────────────────────────────────┐
│ [Pause] [Mute] [Show Script] [Exit]           1 / 6  │
│ Speed: ════════ 1.2x                                 │
│ 🔊 Volume: ════════ 50%                              │
│                                                      │
│              Slide Content                           │
│                                                      │
│        [< Previous] [✓ Auto-advance] [Next >]        │
└──────────────────────────────────────────────────────┘
```

Issues:

- Visual clutter in one area
- Controls compete with content
- No progressive disclosure for secondary settings

### Recommendation: Distributed Controls

```
┌──────────────────────────────────────────────────────┐
│ [X Exit]        ═══════════════════════       1 / 6  │
│                      (progress bar)                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│                  Slide Content                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [◀] [▶❙❙] [⚙️ Settings ▾] [📜 Script]          [▶]  │
└──────────────────────────────────────────────────────┘

[⚙️ Settings flyout]:
┌─────────────────────┐
│ Speed: [━━━●━] 1.2x │
│ Volume: [━━━━●] 50% │
│ ☑ Auto-advance      │
└─────────────────────┘
```

Key improvements:

- Progress bar at top (YouTube-like pattern)
- Exit always visible in top-left
- All playback controls in horizontal bottom bar
- Settings consolidated in flyout
- Consider auto-hide after 3s inactivity

---

## 4. URL-Based Navigation

### Problem

The app is a true SPA with all state in memory:

- Browser back button doesn't work as expected
- Can't bookmark or share a specific state
- Refresh always returns to input state

### Recommendation: Shallow Hash Routing

```
/#/           → Input state (default)
/#/preview    → Preview state
/#/present    → Viewer state
```

Implementation approach:

1. Use `window.history.pushState()` to update URL without reload
2. Listen to `popstate` event for back/forward
3. On mount, read URL and restore appropriate state

**Note:** This is a nice-to-have for a portfolio project. Full deep linking (with presentation data in URL) would require backend persistence.

---

## 5. Accessibility Issues

### Fixed

| Issue                                 | Solution                   | File              |
| ------------------------------------- | -------------------------- | ----------------- |
| Buttons missing cursor-pointer        | Added to base Button class | ui/button.tsx     |
| Export button no accessible label     | Added `sr-only` span       | export-button.tsx |
| Script panel missing aria-describedby | Added SheetDescription     | script-panel.tsx  |

### Remaining

| Issue                                    | Recommendation                       | File                                |
| ---------------------------------------- | ------------------------------------ | ----------------------------------- |
| No `prefers-reduced-motion` support      | Wrap animations in media query check | slide-display.tsx, viewer-intro.tsx |
| Keyboard drag-drop lacks visual feedback | Add help text when drag mode active  | slide-editor.tsx                    |
| Auto-advance default may be aggressive   | Consider defaulting to false         | lib/settings.ts                     |

---

## 6. Additional Issues Identified

### "Watch" Button Disappeared When Dirty (FIXED)

**Problem:** When content was edited after audio generation, the "Watch" button completely disappeared, forcing users to regenerate audio even for a quick preview.

**Solution:** Button now always visible. Shows "Present" when clean, "Preview (No Audio)" when dirty.

### Empty Subtitle Renders Empty Bullet (FIXED)

**Problem:** Title slide with empty subtitle displayed an empty bullet point.

**Solution:** Filter empty subtitle from points array.

### Export Button Icon-Only

**Problem:** Export button showed only download icon with no label.

**Solution:** Added `sr-only` label for screen readers. Consider adding visible "Export" text for clarity.

### No Visual Feedback for Some Operations

Loading indicators exist for generation but not for:

- Saving presentations (instant toast only)
- Loading presentations (instant state change)
- Deleting presentations (no spinner)

These operations are fast, but could add subtle feedback for slower devices.

---

## 7. User Flow Analysis

### Current Flow

```
┌─────────────┐
│   INPUT     │  Content textarea, style selector, examples
│             │  Generate → API call → presentationData
└──────┬──────┘
       │ Generate (success)
       ▼
┌─────────────┐
│   PREVIEW   │  Slide editor, voice selector, drag-drop
│             │  Can: Edit slides, Save, Present, Generate Audio
└──────┬──────┘
       │ Present OR Generate Audio & Present
       ▼
┌─────────────┐
│   VIEWER    │  Full-screen presentation with playback
│             │  Auto-advance, keyboard nav, script panel
└──────┬──────┘
       │ Exit / Escape
       ▼
    [PREVIEW]
```

### User Personas & Gaps

| Persona   | Primary Goal                   | Current Gap                       |
| --------- | ------------------------------ | --------------------------------- |
| Creator   | Transform notes → presentation | ✅ Works well                     |
| Editor    | Refine existing presentation   | ~~"Load" implied playback~~ Fixed |
| Presenter | Deliver presentation           | Controls cluttered                |
| Recipient | View shared file               | Import buried at bottom           |

---

## 8. Quick Reference: File Locations

### State Management

- `src/lib/store.ts` — Zustand store (all app state)
- `src/lib/types.ts` — TypeScript definitions
- `src/lib/settings.ts` — User preferences (persisted)

### Input State

- `src/components/states/input-state.tsx`
- `src/components/input-state/generate-button.tsx`
- `src/components/saved-presentations.tsx`

### Preview State

- `src/components/states/preview-state.tsx`
- `src/components/preview-state/preview-header.tsx` — Back/Save/Present buttons
- `src/components/preview-state/slide-card.tsx` — Individual slide editing
- `src/components/preview-state/voice-selector.tsx`

### Viewer State

- `src/components/states/viewer-state.tsx`
- `src/components/viewer-state/playback-controls.tsx` — Play/Pause/Mute/Exit
- `src/components/viewer-state/slide-navigation.tsx` — Prev/Next/Auto-advance
- `src/components/viewer-state/script-panel.tsx`

### Export/Import

- `src/components/export-import/export-button.tsx`
- `src/components/export-import/import-dialog.tsx`
- `src/components/export-import/import-zone.tsx`

---

## 9. Priority Matrix

| Priority    | Issue                           | Status   | Effort |
| ----------- | ------------------------------- | -------- | ------ |
| 🔴 Critical | Button cursor-pointer           | ✅ Fixed | Low    |
| 🔴 Critical | Button labeling ("Load"→"Open") | ✅ Fixed | Low    |
| 🔴 Critical | Watch button disappearing       | ✅ Fixed | Low    |
| 🟠 High     | Viewer controls layout          | Pending  | Medium |
| 🟠 High     | Information architecture (tabs) | Pending  | Medium |
| 🟡 Medium   | URL-based navigation            | Pending  | Medium |
| 🟡 Medium   | prefers-reduced-motion          | Pending  | Medium |
| 🟡 Medium   | Remaining label changes         | Pending  | Low    |
| 🟢 Low      | Keyboard shortcut discovery     | Pending  | Medium |

---

## Conclusion

The app has excellent technical architecture (Zustand, AudioProvider, IndexedDB persistence) and thoughtful features (double-click delete, demo mode fallback, keyboard shortcuts). The issues identified are primarily UX/labeling decisions that accumulated during incremental development.

The highest-impact fixes have been completed. Remaining work focuses on viewer layout improvements and information architecture refinements that would elevate this from a functional tool to a polished product worthy of being both a portfolio piece and potential paid offering.

---

## Appendix A: Home Page Redesign Recommendations

### Current State Analysis

The home page currently presents a linear vertical flow:

```
┌────────────────────────────────────────────────┐
│               Narrator                          │
│   Transform any text into an AI-narrated...    │
├────────────────────────────────────────────────┤
│   [━━━━━━━━ Content Textarea ━━━━━━━━━]        │
│   Style: [Professional ▼]                       │
│   [Example 1] [Example 2] [Example 3]          │
│   [████████ Generate Presentation ████████]    │
├────────────────────────────────────────────────┤
│   ─── Or load a saved presentation ───         │
│   📄 Presentation 1              [Open][🗑]    │
│   📄 Presentation 2              [Open][🗑]    │
├────────────────────────────────────────────────┤
│   ─── Or import from file ───                  │
│   ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐                │
│   ┆  📤 Drop file or click    ┆                │
│   └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘                │
└────────────────────────────────────────────────┘
```

**Problems:**

1. Returning users (majority of engaged users) must scroll past creation form every time
2. Import recipients must scroll to the bottom
3. "Or" dividers signal secondary pathways — but these are primary for their respective users
4. Visual weight heavily favors first-time creation over other valid entry points
5. No way to bookmark or directly link to a specific view

### Industry Patterns Analysis

| Application     | Pattern                 | Entry Points                             |
| --------------- | ----------------------- | ---------------------------------------- |
| **Figma**       | Tab bar + Grid          | Recent, Drafts, Community, Teams         |
| **Notion**      | Sidebar + Quick actions | New page, Templates, Recent, Favorites   |
| **VS Code**     | Welcome tab cards       | New File, Open, Recent, Help             |
| **Canva**       | Hero + Recent row       | Templates, Recent designs, Shared        |
| **Linear**      | Sidebar + Views         | Inbox, My Issues, Projects, Teams        |
| **Loom**        | Toggle tabs             | Record, Library                          |
| **Pitch**       | Tab bar                 | Presentations, Templates, Shared         |
| **Google Docs** | Gallery + Recents       | Templates gallery, then Recent documents |

**Common patterns in polished tools:**

1. Entry points are **peers**, not primary/secondary
2. Recent/saved work is **immediately visible**, not below fold
3. First-run experience differs from returning user experience
4. URL reflects current view for bookmarking/sharing

### Recommended Redesign: Tabbed Entry Points

```
┌───────────────────────────────────────────────────────────────┐
│  Narrator                                              [?][⚙]│
├───────────────────────────────────────────────────────────────┤
│  [  ✨ Create  ]  [  📚 Library (3)  ]  [  📥 Import  ]       │
│  ─────────────────────────────────────────────────────────────│
│                                                               │
│                    Tab Content Area                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Tab 1: Create (New Users & Creation Flow)

Streamlined creation-focused view:

```
┌───────────────────────────────────────────────────────────────┐
│  What do you want to present?                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                    Content Textarea                     │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Style: [Professional ▼]                                      │
│                                                               │
│  Try an example:  [Sales Pitch] [Tutorial] [Story]           │
│                                                               │
│  [████████████ Generate Presentation ████████████]           │
└───────────────────────────────────────────────────────────────┘
```

**Key changes:**

- No saved presentations or import zone cluttering this view
- Cleaner question-based prompt instead of just "Content"
- Tighter vertical spacing — everything above fold

#### Tab 2: Library (Returning Users)

Card grid layout (inspired by Figma/Notion):

```
┌───────────────────────────────────────────────────────────────┐
│  Your Presentations                              [Sort: Recent ▼]│
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ 📄             │  │ 📄             │  │ 📄             │  │
│  │                │  │                │  │                │  │
│  │ Q3 Sales Pitch │  │ Product Demo   │  │ Team Standup   │  │
│  │ 8 slides • 2d  │  │ 5 slides • 1w  │  │ 4 slides • 1w  │  │
│  │ [Open] [···]   │  │ [Open] [···]   │  │ [Open] [···]   │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Key changes:**

- Grid layout shows more presentations at a glance
- Thumbnail preview (could show title slide)
- Quick actions dropdown [···] for Export, Delete
- Sort/filter options for power users

**Empty State (Critical for Polish):**

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

#### Tab 3: Import (Recipients)

Dedicated, welcoming import experience:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                     📥 Import Presentation                    │
│                                                               │
│         Open a .narrator file shared with you                 │
│                                                               │
│         ┌─────────────────────────────────────────┐          │
│         │                                         │          │
│         │         Drop file here                  │          │
│         │              or                         │          │
│         │         [Browse Files]                  │          │
│         │                                         │          │
│         │     Accepts .narrator and .json files  │          │
│         └─────────────────────────────────────────┘          │
│                                                               │
│         ────────── Recently Imported ──────────              │
│         📄 Imported Presentation       [Open]                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Key changes:**

- Larger, more prominent drop zone
- Clear explanation of what file types are accepted
- Optional: track recently imported files separately

### URL Routing for Tabs

Combine with Section 4's URL routing recommendation:

```
/#/             → Create tab (default for new users)
/#/library      → Library tab (default for returning users*)
/#/import       → Import tab
/#/preview      → Preview state
/#/present      → Viewer state
```

\*Consider detecting returning users via `savedPresentations.length > 0` and defaulting to Library.

### First-Run vs. Returning User

| Aspect            | First-Run User         | Returning User       |
| ----------------- | ---------------------- | -------------------- |
| Default tab       | Create                 | Library              |
| Header size       | Full (brand + tagline) | Compact (brand only) |
| Example buttons   | Prominent              | De-emphasized        |
| Library tab badge | Hidden                 | Shows count          |

Implementation hint: Store `hasCreatedPresentation` in localStorage to detect returning users.

### Mobile Considerations

On viewports < 640px:

```
┌─────────────────────────────┐
│  Narrator              [☰] │
├─────────────────────────────┤
│ [Create] [Library] [Import] │  ← Horizontal scroll if needed
├─────────────────────────────┤
│                             │
│      Tab Content            │
│      (Full width)           │
│                             │
└─────────────────────────────┘
```

- Tabs become scrollable pills
- Library switches from grid to list view
- Bottom sheet for secondary actions

### Implementation Complexity

| Change                             | Effort | Impact |
| ---------------------------------- | ------ | ------ |
| Add tab component & state          | Low    | High   |
| Move existing components into tabs | Low    | High   |
| URL routing for tabs               | Medium | Medium |
| Library grid layout                | Medium | High   |
| Empty states                       | Low    | Medium |
| First-run detection                | Low    | Medium |
| Mobile responsive tabs             | Medium | Medium |

### Visual Polish Details

For portfolio-level polish, consider:

1. **Tab transitions** — Framer Motion crossfade between tab contents
2. **Skeleton loading** — Show skeleton cards while presentations load from IndexedDB
3. **Hover states** — Library cards lift slightly on hover (subtle shadow change)
4. **Keyboard navigation** — Tab key cycles through tabs, arrow keys within
5. **Focus indicators** — Visible focus rings on all interactive elements

### Summary

The current home page serves first-time creators well but treats returning users and import recipients as afterthoughts. A tab-based architecture:

1. **Elevates all three user journeys** to equal status
2. **Reduces cognitive load** by showing only relevant UI per task
3. **Enables URL-based navigation** (back button, bookmarks)
4. **Demonstrates senior-level thinking** about information architecture
5. **Matches industry patterns** from Figma, Notion, VS Code, etc.

This change would significantly elevate the perceived polish of the application while remaining technically straightforward to implement.
