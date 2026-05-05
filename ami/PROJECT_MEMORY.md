# AMI — Project Memory
> **AGENT INSTRUCTION:** After completing any task, rewrite the "Current Status" and "What's Left" sections of this file to reflect actual progress. This file is the shared memory between AI models working on this project. Never delete sections — append or update them.

---

## 1. What AMI Is

**AMI** (Autonomous Hyper-Personalized Learning Orchestrator) is a hackathon-grade full-stack educational web app. It takes any topic (text query, Wikipedia link, or uploaded file) and generates a complete, personalized multi-format learning experience in seconds.

The five learning formats ("5 pillars") are:
1. **Source** — raw extracted text from the original material
2. **Immersive Text** — structured article with quizzes, diagrams, and a vertical roadmap sidebar
3. **Slides & Narration** — animated 16:9 slide deck
4. **Audio Lesson** — narrated audio with chapter markers and equalizer animation
5. **Mindmap** — interactive pan/zoom/collapse concept map
6. **Test Knowledge** (6th tab) — free-text self-explanation scored by AI

---

## 2. Design Language & Visual System

### Color Palette (CSS Custom Properties)
```css
/* Base */
--cream: #FAF8F5
--cream-deep: #F0EDE8
--paper: #FFFFFF

/* Peach (primary accent) */
--peach-50: #FFF5EE
--peach-100: #FFECDD
--peach-200: #FFD9BB
--peach-300: #FFCBA4  (main peach)
--peach-400: #FFB085
--peach-500: #FF9466  (hover/active)

/* Lavender (secondary accent) */
--lav-50: #F3F3FE
--lav-100: #E6E6FA
--lav-200: #CFCEF2
--lav-300: #B4B2E8
--lav-400: #A09DCE
--lav-500: #8C8AD6  (active)

/* Ink (typography) */
--ink-100 … --ink-900

/* Semantic */
--success: #4FB07A
--error: #E26A5C
--info: var(--lav-500)
```

### Typography
- **Font:** Inter (body) + Playfair Display (hero headings)
- **Utility classes:** `.h1`, `.h2`, `.h3`, `.eyebrow`, `.body`, `.muted`
- **Eyebrow:** 11px, 700, uppercase, letter-spacing 0.1em, peach-500

### Buttons
- `.pill` — base pill button (rounded, no border)
- `.pill-primary` — peach gradient, white text
- `.pill-ghost` — transparent, ink border
- `.pill-lavender` — lavender tint
- `.icon-btn` — 36px circle icon button
- `.link-btn` — text-only with arrow feel

### Animations (defined in globals.css)
- `wave-drift-1/2/3` — landing page blobs (28s/36s/22s, ease-in-out)
- `pulse-glow` — glowing orb on loading page
- `spin-slow` — rotating rings (14s/22s/30s, linear)
- `orbit` — particles orbiting in a circle
- `audio-bounce` — equalizer bars
- `fade-up` — content enter animation
- `fade-in` — opacity entrance
- `slide-in-right` — tab transition
- `user-menu-in` — dropdown scale animation
- `.stagger > *:nth-child(n)` — staggered animation delays on grid children

### Layout
- `--r-sm/md/lg/xl/pill` — border-radius scale
- `--shadow-sm/md/lg` — box-shadow scale
- `--ease-organic` — cubic-bezier(0.25, 0.46, 0.45, 0.94)
- `--ease-spring` — cubic-bezier(0.175, 0.885, 0.32, 1.275)
- `.topbar` — sticky header: brand left, persona center, actions right
- Dark mode via `data-theme="dark"` on `<html>` — all custom properties update

---

## 3. File Structure

```
ami/
├── index.html                    ← Google Fonts, root div
├── vite.config.js                ← React plugin, /api → localhost:8000 proxy
├── package.json                  ← react 18, react-dom, vite, @vitejs/plugin-react
├── src/
│   ├── main.jsx                  ← ReactDOM.createRoot('#root')
│   ├── App.jsx                   ← Root: routes, modals, auth state
│   ├── styles/
│   │   └── globals.css           ← Full design system (tokens, classes, keyframes)
│   ├── components/
│   │   ├── ui/
│   │   │   └── Icons.jsx         ← Ico.* export (~40 SVG icons)
│   │   └── layout/
│   │       └── TopBar.jsx        ← BrandMark, Brand, UserMenu, TopBar
│   ├── data/
│   │   └── content.js            ← PHOTO_CONTENT, HISTORY_ITEMS, SUBJECTS
│   └── pages/
│       ├── LandingPage.jsx       ← PeachWaves, VisualizerCard, HeroSearch
│       ├── LoginPage.jsx         ← 4 modes: choice/returning/new/google-complete
│       │                            Eye-tracking character animations (4 characters)
│       ├── DashboardPage.jsx     ← Login-aware: history grid OR "How it works" tiles
│       ├── LoadingPage.jsx       ← Orb + rings + particles + 4-phase progress
│       ├── QuickLearningPage.jsx ← Peach waves + glass card + drop zone + deadline
│       └── LearningHub.jsx       ← 6-tab hub + floating AI chatbot
```

---

## 4. Routing (useState-based, no React Router)

Routes managed in `App.jsx` via `useState`:
```
'landing' → LandingPage
'login'   → LoginPage
'dashboard' → DashboardPage
'upload'  → QuickLearningPage
'loading' → LoadingPage
'hub'     → LearningHub
```

---

## 5. Auth State (App.jsx)

```js
const [user, setUser] = useState(null) // null = guest
// user object: { name, email, age, qualification }
```

- `onLogin(userData)` → sets user + routes to dashboard
- `onLogout()` → clears user + routes to landing
- `onDeleteAccount()` → clears user + closes modal + routes to landing
- `onAccountSave(updates)` → merges updates into user

All authenticated pages receive `topbarProps`:
```js
{ persona, onChangePersona, onAccountSettings, onLogout, dark, onToggleDark, user }
```

---

## 6. Persona System

```js
// App.jsx state
const [grade, setGrade] = useState('High schooler')
const [interest, setInterest] = useState('music')

const persona = { grade, interest, iconNode: <Ico.Music/> }
```

`PersonaModal` — choose reading level + interest. Adapts analogies/examples in generated content.

`AccountSettingsModal` — name, age, qualification, disabled email, red "Delete Account" with confirmation step.

---

## 7. Key Components Explained

### LoginPage
Four modes: `choice` → show 3 options; `returning` → email+password form; `new` → full signup form; `google-complete` → profile completion after Google login.

Left panel: purple gradient + 4 animated characters. Characters react to typing (hide on password, lean toward input, random blinking).

### LearningHub Tabs
Tab navigation in `PILLARS` array. Adding a new tab = add entry to array + add render condition.

### ImmersivePillar (Roadmap mode)
- `sectionStatus[]` tracks 'done' | 'current' | 'locked' for each TOC section
- Wrong quiz answer → `setCurrentSection(0)` (full reset)
- Correct quiz answer → `setCurrentSection(prev + 1)` (advance)
- All done → `showToast = true` → `CompletionToast` appears for 4.2s
- `RoadmapSidebar` — vertical track line with node dots, filled segment, percentage bar

### AIChatbot (LearningHub)
- Floating button bottom-right (56px circle, gradient)
- `isOffTopic(text)` checks message for topic keywords
- 2-strike system: warning 1 = yellow, strike 2 = red lock message
- Mock responses scoped to photosynthesis (will be replaced by real API)

### TestKnowledgePillar
- Free-text textarea (min 80 chars)
- Mock AI scoring: keyword detection + length heuristic → 0–100 score
- Score ring SVG, rubric label, strengths list, gaps list
- "Try again" resets; shows previous answer in `<details>`

### QuickLearningPage
- Multiple file upload (PDF + images)
- Deduplication by filename
- Deadline picker: 1hr / 2hr / 4hr / 1day / 3day / 1week
- Optional module title (inferred from filename if blank)
- Passes `{ title, files, deadline }` to `onSubmit` → App routes to loading

---

## 8. Data (content.js)

`PHOTO_CONTENT` — photosynthesis mock:
- `title`, `subtitle`, `source.excerpt`
- `toc[]` — 4 sections with `id`, `title`, `done`, `current` flags
- `sections[]` — mix of `objectives`, `prose` (with optional `figure`), `inline-quiz` kinds
- `slides[]` — 5 slides: cover/equation/split/diagram/stat
- `audio` — title, duration, chapters[]
- `mindmap` — nodes with id/label/parent/x/y

`HISTORY_ITEMS[]` — 8 mock items: subject/title/progress/scene
`SUBJECTS` — subject→{color, icon} mapping

---

## 9. Backend (To Be Built)

Stack: **FastAPI** + **Python**. Proxy already configured in vite.config.js (`/api → http://localhost:8000`).

### Planned Agents (Multi-Agent Architecture)
1. **Search & Scrape Agent** — takes topic query, fetches Wikipedia + textbooks + trusted sources
2. **Image Generation Agent** — creates topic-relevant images for slides
3. **Slides + Narration Agent** — generates slide content + speaker notes
4. **Immersive Text Agent** — structures content into sections, objectives, quizzes
5. **Audio Narration Agent** — TTS + chapter markers
6. **Mindmap Agent** — extracts concepts, builds node/edge graph

Plus:
- **RAG Chatbot** — topic-locked retrieval over generated content
- **Auth endpoints** — `/api/auth/login`, `/api/auth/register`, `/api/auth/google`
- **API Key Rotation** — round-robin across multiple Gemini API keys

### Shared Memory Format (between agents)
```json
{
  "topic": "Photosynthesis",
  "persona": { "grade": "High schooler", "interest": "music" },
  "source_text": "...",
  "toc": [...],
  "sections": [...],
  "slides": [...],
  "audio_script": "...",
  "mindmap_nodes": [...],
  "images": [{ "slide_id": 2, "url": "..." }]
}
```

---

## 10. Current Status

**As of:** May 2026

### ✅ Completed
- [x] Vite + React project scaffold (manual, no npm registry needed)
- [x] Full design system (globals.css, TopBar, Icons)
- [x] LandingPage (peach waves, hero search, visualizer card)
- [x] LoginPage (4 modes, eye-tracking characters, animated panel)
- [x] DashboardPage (login-aware: history grid for users, "How it works" for guests)
- [x] LoadingPage (orb, rings, particles, 4-phase checklist)
- [x] QuickLearningPage (glass card, multi-file drop zone, deadline picker)
- [x] LearningHub — 6 tabs:
  - Source, Immersive Text (roadmap), Slides, Audio, Mindmap, Test Knowledge
- [x] Floating AI Chatbot (2-strike off-topic system)
- [x] TopBar UserMenu (Personalize / Account Settings / Log out — all wired)
- [x] PersonaModal (reading level + interests)
- [x] AccountSettingsModal (name/age/qualification + Delete Account)
- [x] Auth state (login/logout/delete in App.jsx)
- [x] Roadmap progress bar in ImmersivePillar (vertical, resets on wrong, toast on complete)

### 🔲 What's Left

**Frontend:**
- [ ] Connect real Gemini API calls (replace mock content in LearningHub/content.js)
- [ ] Persist learning history in localStorage or backend
- [ ] Real Google OAuth flow
- [ ] Mobile responsiveness pass (tab bar wraps awkwardly on small screens)
- [ ] Slide "auto-play" narration sync (currently just timer-based)
- [ ] Audio player with real TTS audio

**Backend:**
- [ ] FastAPI project setup
- [ ] Auth endpoints (email + Google)
- [ ] Search & Scrape agent
- [ ] Immersive Text agent
- [ ] Slides + Narration agent
- [ ] Audio agent (TTS)
- [ ] Mindmap agent
- [ ] Image generation agent
- [ ] RAG Chatbot (topic-locked)
- [ ] API key rotation middleware
- [ ] Module storage (PostgreSQL or Supabase)

---

## 11. Key Decisions & Conventions

1. **No React Router** — single `useState` route string. Simple, hackathon-friendly.
2. **No Tailwind** — pure CSS custom properties + scoped inline styles. Zero build complexity.
3. **No external images** — all scene art and diagrams are inline SVG.
4. **Vite proxy** — `/api/*` → `localhost:8000`. Frontend never hardcodes backend URL.
5. **Mock content first** — all pillars render real mock data from `content.js`. Swap with API calls by replacing the import.
6. **Persona is local state** — not stored in backend yet. Will be part of user profile.
7. **Gemini API** — primary AI provider. Key rotation handles free-tier limits.
8. **All agent outputs merge into one JSON blob** — shared memory format above. Frontend reads from it.
