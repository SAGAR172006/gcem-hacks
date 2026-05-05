# AMI — Fix Prompt for Next IDE Session

## Project Overview
AMI is an AI-powered personalized learning app. Stack:
- **Frontend**: React 18 + Vite, JSX, CSS custom properties (no Tailwind). Located at `ami/frontend/`
- **Backend**: Node.js + Express + TypeScript, LangGraph agents. Located at `ami/backend/`
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Google Gemini 2.0 Flash (`gemini-2.0-flash`) via `@google/generative-ai`

## Current State (as of this writing)

### What Works
- Full auth flow: register, login, logout, Google OAuth, persistent token in localStorage
- Two-phase generation: Phase 1 (text content) responds immediately, Phase 2 (slides/mindmap/audio) runs in background
- Learning events tracked in Supabase (`learning_events` table)
- Adaptive persona injection (enrichPersona reads history, injects adaptiveContext)
- Source caching (topic_key in `source_cache` table, 7-day TTL)
- Per-key cooldown on 429 errors (65s freeze, round-robin across all keys)
- Test Knowledge: real Gemini scoring with score/strengths/gaps/suggestion
- Frontend: immersive text, quizzes, mindmap, slides, audio tabs all display

### Core Problem: API Quota Exhaustion
**27 Gemini API keys across 27 accounts** are still hitting quota. Here's why:

Each module generation makes **10+ sequential Gemini calls**:
- Phase 1 (text agent): TOC + objectives + 4×(prose+quiz) + title = **7 calls**
- Phase 2 (background): slides + mindmap + audio = **3 calls**
- Total = **10 calls per module**

Gemini 2.0 Flash free tier limits: ~15 requests/minute per key, ~1500/day per key.
With 27 keys in round-robin, we get ~405 RPM total — but all 10 calls happen in <30s, 
creating a burst that exhausts the single-key RPM limit before rotation helps.

### What Was Just Implemented (Frontend Change)
In `ami/frontend/src/pages/LearningHub.jsx`, the Slides and Audio tabs now need 
to show a "still generating" loader instead of mock content when `module.status !== 'complete'`.

The current code always shows mock `PHOTO_CONTENT` for slides and audio. This needs to 
be changed so that:
1. When `module.status === 'complete'` AND `module.slides.length > 0` → show real slides
2. When `module.status === 'complete'` AND `module.mindmap.length > 0` → show real mindmap  
3. Otherwise (still generating or failed) → show a "Media generating..." placeholder
4. The hub polls `GET /api/modules/:id/status` every 5s until status === 'complete'

---

## Files to Know

### Backend Key Files
```
ami/backend/src/
├── index.ts              — Express app, mounts all routers
├── config.ts             — GEMINI_KEY_1..KEY_27 loaded, sorted, exported as geminiKeys[]
├── services/
│   └── gemini.ts         — Key rotation, per-key cooldown, callGemini / callGeminiJSON / callGeminiVision
├── agents/
│   ├── orchestrator.ts   — runPhase1() and runPhase2() exported separately
│   ├── textAgent.ts      — 7 sequential Gemini calls (TOC, objectives, 4 sections, title)
│   ├── slidesAgent.ts    — 1 Gemini call + Unsplash image fetches
│   ├── mindmapAgent.ts   — 1 Gemini call
│   ├── audioAgent.ts     — 1 Gemini call
│   └── searchAgent.ts    — SerpAPI + Wikipedia scrape, with Supabase source_cache
├── routers/
│   ├── auth.ts           — register, login, logout, google OAuth, /me CRUD
│   ├── modules.ts        — generate, upload, list, get, status polling, progress, delete
│   └── stats.ts          — quiz events, test events, AI explanation scoring, /me stats
└── types/index.ts        — Module, Persona (with adaptiveContext?), TextContent, etc.
```

### Frontend Key Files
```
ami/frontend/src/
├── App.jsx               — Auth state, route state, session restore from localStorage
├── services/api.js       — All API calls, token management (getToken/setToken/clearToken)
├── pages/
│   ├── LandingPage.jsx   — Hero with animated waves
│   ├── LoginPage.jsx     — Register + Login forms
│   ├── DashboardPage.jsx — Module list, search bar
│   ├── LoadingPage.jsx   — Generation progress screen
│   ├── LearningHub.jsx   — 6-tab learning view (SOURCE, TEXT, SLIDES, AUDIO, MINDMAP, TEST)
│   └── QuickLearningPage.jsx — File upload page
├── data/content.js       — PHOTO_CONTENT mock data (used as fallback)
└── styles/globals.css    — CSS custom properties (design tokens)
```

---

## Immediate Tasks Needed

### Task A — Frontend: Poll for completion + show generating state
In `LearningHub.jsx`:

1. Accept `module` prop (already done). Add a `useEffect` that polls 
   `api.getModuleStatus(module.id)` every 5 seconds while `moduleStatus !== 'complete'`.

2. Store `moduleStatus` and `liveModule` in state (start from the passed `module` prop).

3. In `SlidesPillar` and `AudioPillar`:
   - If `liveModule?.status !== 'complete'` OR slides/audio not yet populated → show a 
     "⏳ Still generating..." placeholder UI
   - If complete with real data → render real slides/audio
   - The mindmap already works similarly (show placeholder if no data)

4. The `ImmersivePillar` should ALWAYS show immediately (it's from Phase 1, always ready).

Example placeholder UI (keep it on-brand):
```jsx
<div style={{ padding: '80px 48px', textAlign: 'center' }}>
  <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--peach-300)', 
    borderTopColor: 'var(--peach-500)', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 20px' }}/>
  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Generating your {mediaType}…</h3>
  <p className="muted" style={{ fontSize: 14 }}>
    While you wait, explore Immersive Text, Quizzes, and Test Knowledge — they're ready now.
  </p>
</div>
```

### Task B — Backend: Reduce Gemini calls in Phase 1 (OPTIONAL, risky)
The `textAgent.ts` currently makes 7 calls. To reduce to 2-3:

**Option 1 (Recommended):** Combine TOC + objectives into one call that returns both.
Then combine all 4 sections into a single call returning `{ sections: [...] }`.
This reduces Phase 1 from 7 → 2 calls.

**Option 2:** Keep 7 calls but add a longer delay (3-5s) between them. This spreads 
load but adds 15-25s to generation time.

The combined prompt approach (Option 1) in `textAgent.ts` would look like:
```
Generate a full immersive text module for: {topic}
Return JSON: { toc: [...], objectives: {...}, sections: [{ prose: {...}, quiz: {...} }, ...], title: "...", subtitle: "..." }
```
Risk: larger JSON is more likely to fail parsing or get truncated by Gemini.

### Task C — Backend: Mindmap generation without Gemini
The mindmap is pure layout (nodes + positions). Instead of calling Gemini, derive it 
directly from the TOC sections that Phase 1 already produced:

In `modules.ts` `runBackgroundPhase2`, build the mindmap from textContent.toc instead 
of calling Gemini:

```typescript
function buildMindmapFromTOC(textContent: TextContent): MindmapNode[] {
  const positions = [
    { x: -220, y: -140 }, { x: 220, y: -140 },
    { x: -220, y: 140 },  { x: 220, y: 140 }
  ];
  const nodes: MindmapNode[] = [
    { id: 'root', label: textContent.title, parent: null, x: 0, y: 0 }
  ];
  textContent.toc.forEach((section, i) => {
    const pos = positions[i] || { x: (i % 2 === 0 ? -220 : 220), y: (i < 2 ? -140 : 140) };
    nodes.push({ id: 'n' + (i+1), label: section.title, parent: 'root', x: pos.x, y: pos.y });
  });
  return nodes;
}
```
This eliminates 1 Gemini call from Phase 2.

### Task D — Backend: Audio uses Web Speech API instead of Gemini script
Instead of generating a full script with Gemini, just store the textContent prose 
sections as the "script" and let the frontend use `window.speechSynthesis` to read it.

This eliminates 1 more Gemini call from Phase 2. Phase 2 would only need slides (1 call).

---

## Supabase Tables Required
Run this SQL if not already done:

```sql
-- Source cache (prevents re-fetching same topic)
CREATE TABLE IF NOT EXISTS source_cache (
  topic_key text PRIMARY KEY,
  content jsonb NOT NULL,
  cached_at timestamptz NOT NULL DEFAULT now()
);

-- Learning events (paced learning / adaptive context)
CREATE TABLE IF NOT EXISTS learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid,
  event_type text NOT NULL,  -- 'quiz' | 'test' | 'explanation'
  section_id text,
  correct boolean,
  attempts integer DEFAULT 1,
  score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own events" ON learning_events FOR ALL USING (auth.uid() = user_id);

-- Status column on modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS status text DEFAULT 'complete';
```

---

## Environment Variables (backend .env)
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
GEMINI_KEY_1=...
GEMINI_KEY_2=...
...
GEMINI_KEY_27=...
SERPAPI_KEY=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Key Architectural Decisions Already Made
- No streaming (Gemini responses are collected fully then parsed as JSON)
- All agents return strongly-typed TypeScript objects
- Frontend always falls back to `PHOTO_CONTENT` mock if no real module data
- Token stored as `ami_token` in localStorage
- Two-phase generation: Phase 1 response → hub shows immediately → Phase 2 background
- Source cache key = `topic.toLowerCase().trim().replace(/\s+/g, '_')`

---

## What NOT to Change
- The CSS design tokens in `globals.css` — the whole design system is built on them
- The `PHOTO_CONTENT` fallback in `data/content.js` — keep it as the fallback
- Auth middleware in `middleware/auth.ts` — it works correctly
- The `requireAuth` pattern on all protected routes

---

## Quick Start Commands
```bash
# Backend
cd ami/backend
node dist/index.js          # run compiled version
# OR: npx ts-node src/index.ts   # run directly (slower)

# Frontend
cd ami/frontend
npm run dev                  # Vite dev server on :5173

# Rebuild backend after changes
cd ami/backend
npx tsc --noEmit && npx tsc  # type-check then compile
```

---

## Current Priority Order
1. **Frontend polling + generating placeholder** (Task A) — highest priority, unblocks UX
2. **Mindmap from TOC without Gemini** (Task C) — saves 1 call, easy win
3. **Audio via Web Speech API** (Task D) — saves 1 call, medium effort
4. **Combine Gemini calls in textAgent** (Task B) — saves 5 calls, riskiest
