# AMI Backend Prompts — Ordered for Kiro / Antigravity IDE
> Run these prompts **in order**. Each one builds on what came before. Do not skip steps.
> Stack: Node.js · Express.js · TypeScript · Supabase (Auth + PostgreSQL + pgvector) · LangGraph.js · Google Gemini 1.5 Flash · Unsplash Source API · Axios
>
> **Frontend stays untouched** — plain React 18 + Vite + JSX. Only the Vite proxy port changes.
> **Supabase schema must be set up first** — run all 6 SQL queries from the setup guide before starting Prompt 1.

---

## PROMPT 1 — Node.js + Express Project Setup

```
Create a Node.js + Express backend written in TypeScript for an AI learning app called AMI.

Project location: ami/backend/
Replace everything currently in that folder.

Final folder structure:
ami/backend/
├── src/
│   ├── index.ts              ← Express app entry point
│   ├── config.ts             ← env vars, typed and validated
│   ├── middleware/
│   │   ├── auth.ts           ← Supabase JWT verification middleware
│   │   └── errorHandler.ts   ← Global error handler
│   ├── routers/
│   │   ├── auth.ts           ← /api/auth/*
│   │   ├── modules.ts        ← /api/modules/*
│   │   └── chat.ts           ← /api/chat/*
│   ├── agents/
│   │   ├── searchAgent.ts
│   │   ├── textAgent.ts
│   │   ├── slidesAgent.ts
│   │   ├── audioAgent.ts
│   │   ├── mindmapAgent.ts
│   │   └── imageAgent.ts
│   ├── services/
│   │   ├── gemini.ts         ← Gemini client with key rotation
│   │   ├── supabase.ts       ← Supabase client (anon + service role)
│   │   └── axios.ts          ← Axios instance with failover interceptor
│   └── types/
│       └── index.ts          ← Shared TypeScript interfaces
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json

In src/index.ts:
- Create Express app
- Add cors middleware allowing http://localhost:5173
- Add express.json() body parser
- Add express-fileupload for multipart support
- Mount routers: app.use('/api/auth', authRouter) etc.
- Add global error handler (import from middleware/errorHandler.ts)
- Add GET /api/health → res.json({ status: 'ok' })
- Listen on PORT from env (default 3001)

In package.json include these dependencies:
  express, cors, dotenv, axios, @supabase/supabase-js,
  @google/generative-ai, @langchain/langgraph, @langchain/google-genai,
  express-fileupload, pdf-parse, multer, uuid
Dev dependencies:
  typescript, ts-node, nodemon, @types/express, @types/cors,
  @types/node, @types/uuid, @types/express-fileupload, @types/pdf-parse

In tsconfig.json:
  target: ES2022, module: CommonJS, outDir: dist,
  rootDir: src, strict: true, esModuleInterop: true, resolveJsonModule: true

In .env.example:
  PORT=3001
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_KEY=your_service_role_key
  GEMINI_KEY_1=your_gemini_key_here
  GEMINI_KEY_2=optional_second_key
  UNSPLASH_ACCESS_KEY=your_unsplash_key

Run command: npx nodemon --exec ts-node src/index.ts
Dev script in package.json: "dev": "nodemon --exec ts-node src/index.ts"
```

---

## PROMPT 2 — TypeScript Types

```
In src/types/index.ts, define all shared TypeScript interfaces used across the backend.

export interface Persona {
  grade: string;       // e.g. "High schooler"
  interest: string;    // e.g. "music"
}

export interface SourceContent {
  topic: string;
  sourceTitle: string;
  sourceExcerpt: string;
  sourceUrl: string | null;
}

export interface TocItem {
  id: string;
  title: string;
  done: boolean;
  current: boolean;
}

export interface QuizChoice {
  id: string;
  text: string;
  correct: boolean;
}

export type SectionKind = 'objectives' | 'prose' | 'inline-quiz';

export interface Section {
  id: string;
  kind: SectionKind;
  heading?: string;
  body?: string;
  items?: string[];
  figure?: string;
  question?: string;
  hint?: string;
  choices?: QuizChoice[];
}

export interface TextContent {
  title: string;
  subtitle: string;
  toc: TocItem[];
  sections: Section[];
}

export type SlideKind = 'cover' | 'equation' | 'split' | 'stat' | 'bullet';

export interface Slide {
  id: string;
  kind: SlideKind;
  title: string;
  subtitle?: string;
  points?: string[];
  stat?: string;
  caption?: string;
  cards?: { label: string; title: string; body: string }[];
  imageUrl?: string | null;
  narration: string;
}

export interface AudioChapter {
  title: string;
  timestamp: number;
}

export interface AudioContent {
  title: string;
  script: string;
  chapters: AudioChapter[];
}

export interface MindmapNode {
  id: string;
  label: string;
  parent: string | null;
  x: number;
  y: number;
}

export interface Module {
  id: string;
  userId: string;
  topic: string;
  persona: Persona;
  source: SourceContent;
  textContent: TextContent;
  slides: Slide[];
  mindmap: MindmapNode[];
  audio: AudioContent;
  progress: number;
  fromUpload: boolean;
  deadline: string | null;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  age: number | null;
  qualification: string | null;
  grade: string;
  interest: string;
}
```

---

## PROMPT 3 — Supabase Client Service

```
In src/services/supabase.ts, create two Supabase clients:

import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Anon client — used for auth operations (respects Row Level Security)
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

// Service role client — used server-side to bypass RLS (e.g. creating profiles)
// NEVER expose this key to the frontend
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey)

In src/config.ts, validate and export all env vars:

import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceKey: requireEnv('SUPABASE_SERVICE_KEY'),
  geminiKeys: Object.entries(process.env)
    .filter(([k]) => k.startsWith('GEMINI_KEY_'))
    .map(([, v]) => v as string)
    .filter(Boolean),
  unsplashKey: process.env.UNSPLASH_ACCESS_KEY || null,
}

if (config.geminiKeys.length === 0) {
  throw new Error('No Gemini API keys found. Set GEMINI_KEY_1 in your .env file.')
}
```

---

## PROMPT 4 — Gemini Client with Key Rotation + Axios Failover Interceptor

```
In src/services/gemini.ts, implement Gemini API calls with round-robin key rotation:

import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'

let keyIndex = 0

function getClient(): { client: GoogleGenerativeAI; index: number } {
  const index = keyIndex % config.geminiKeys.length
  keyIndex++
  console.log(`[Gemini] Using key index ${index}`)
  return { client: new GoogleGenerativeAI(config.geminiKeys[index]), index }
}

export async function callGemini(prompt: string, modelName = 'gemini-1.5-flash'): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { client } = getClient()
      const model = client.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      const isQuota = err?.status === 429 || String(err).includes('429')
      if (isQuota && attempt === 0) {
        console.warn('[Gemini] Quota hit, retrying with next key...')
        continue
      }
      throw err
    }
  }
  throw new Error('All Gemini keys exhausted')
}

export async function callGeminiJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.'
  const text = await callGemini(fullPrompt)
  const cleaned = text.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned) as T
}

---

In src/services/axios.ts, create an Axios instance with a retry interceptor:

import axios from 'axios'

export const httpClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Retry once on network errors or 5xx responses
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config || config._retried) return Promise.reject(error)

    const shouldRetry =
      !error.response || // network error
      error.response.status >= 500

    if (shouldRetry) {
      config._retried = true
      console.warn(`[Axios] Retrying request to ${config.url}`)
      await new Promise((r) => setTimeout(r, 1000))
      return httpClient(config)
    }

    return Promise.reject(error)
  }
)
```

---

## PROMPT 5 — Auth Middleware + Auth Router

```
In src/middleware/auth.ts, implement Supabase JWT verification:

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../services/supabase'
import { AuthUser } from '../types'

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' })

  // Fetch profile from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  req.user = {
    id: data.user.id,
    email: data.user.email!,
    name: profile?.name || 'Learner',
    age: profile?.age || null,
    qualification: profile?.qualification || null,
    grade: profile?.grade || 'High schooler',
    interest: profile?.interest || 'music',
  }

  next()
}

---

In src/routers/auth.ts, implement these endpoints:

POST /api/auth/register
  Body: { email, password, name, age?, qualification? }
  - Call supabase.auth.signUp({ email, password, options: { data: { name } } })
  - If successful, update the auto-created profile with age, qualification
  - Return: { token: session.access_token, user: AuthUser }

POST /api/auth/login
  Body: { email, password }
  - Call supabase.auth.signInWithPassword({ email, password })
  - Return: { token: session.access_token, user: AuthUser }

POST /api/auth/google
  Body: { accessToken: string }  ← Google OAuth access token from frontend
  - Call supabase.auth.signInWithIdToken({ provider: 'google', token: accessToken })
  - Return: { token: session.access_token, user: AuthUser, isNewUser: bool }
  - isNewUser = true if the profile was just created (check created_at within last 10 seconds)

POST /api/auth/logout
  - Requires requireAuth middleware
  - Call supabase.auth.signOut()
  - Return: { success: true }

GET /api/auth/me
  - Requires requireAuth middleware
  - Return: req.user

PUT /api/auth/me
  Body: { name?, age?, qualification?, grade?, interest? }
  - Requires requireAuth middleware
  - Update public.profiles where id = req.user.id
  - Return updated profile as AuthUser

DELETE /api/auth/me
  - Requires requireAuth middleware
  - Use supabaseAdmin to delete from auth.users (cascades to profiles + modules)
  - Return: { success: true }
```

---

## PROMPT 6 — Search & Scrape Agent

```
In src/agents/searchAgent.ts, implement:

export async function searchAndScrape(topic: string, persona: Persona): Promise<SourceContent>

This agent fetches and cleans raw source material for a topic.

Steps:
1. Fetch Wikipedia summary using httpClient from services/axios.ts:
   GET https://en.wikipedia.org/api/rest_v1/page/summary/{encodeURIComponent(topic)}
   Extract: title, extract (the summary text)

2. Fetch the full article text:
   GET https://en.wikipedia.org/w/api.php?action=query&titles={topic}&prop=extracts&explaintext=1&format=json
   Extract the full page text from response.query.pages[pageId].extract

3. Prefer the full article text. If it fails, fall back to the summary.

4. Clean the text:
   - Remove citation brackets: text.replace(/\[\d+\]/g, '')
   - Remove [edit] markers: text.replace(/\[edit\]/gi, '')
   - Collapse multiple newlines: text.replace(/\n{3,}/g, '\n\n')
   - Trim whitespace

5. Truncate to max 8000 characters (cut at last complete sentence before the limit)

6. Return:
   {
     topic,
     sourceTitle: `${title} — Wikipedia`,
     sourceExcerpt: cleanedText,
     sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`
   }

Handle errors gracefully with try/catch. If Wikipedia fails entirely, throw an error
with message: `Could not find source material for "${topic}". Try a more specific topic.`

The persona parameter is accepted but not used here — it gets passed to later agents.
```

---

## PROMPT 7 — Immersive Text Agent

```
In src/agents/textAgent.ts, implement:

export async function generateImmersiveText(source: SourceContent, persona: Persona): Promise<TextContent>

Use callGeminiJSON from services/gemini.ts.

Build and send this prompt dynamically:

`You are AMI, a hyper-personalized educational AI. Transform the following source material
into a structured learning module.

Topic: ${source.topic}
Student reading level: ${persona.grade}
Student interest: ${persona.interest} — use this to craft analogies and real-world examples

Source material:
${source.sourceExcerpt}

Return a JSON object with EXACTLY this structure (no extra fields):
{
  "title": "string — the topic title",
  "subtitle": "string — one engaging sentence describing what the student will learn",
  "toc": [
    { "id": "s1", "title": "Section Title", "done": false, "current": false }
  ],
  "sections": [
    {
      "id": "obj1",
      "kind": "objectives",
      "heading": "What you'll learn",
      "items": ["At least 3 specific learning outcomes"]
    },
    {
      "id": "p1",
      "kind": "prose",
      "heading": "Section heading",
      "body": "Paragraph text. Use **bold** for key terms.\n\nWrite a second paragraph."
    },
    {
      "id": "q1",
      "kind": "inline-quiz",
      "question": "A question testing understanding of this section?",
      "hint": "A helpful hint without giving away the answer",
      "choices": [
        { "id": "a", "text": "Wrong option", "correct": false },
        { "id": "b", "text": "Correct option", "correct": true },
        { "id": "c", "text": "Wrong option", "correct": false },
        { "id": "d", "text": "Wrong option", "correct": false }
      ]
    }
  ]
}

Rules:
- Generate exactly 4 TOC sections
- Each TOC section maps to: 1 prose block + 1 inline-quiz block in sections array
- First section must start with an objectives block
- Each quiz has exactly 4 choices, exactly 1 correct answer
- Tailor every analogy and example to: ${persona.interest}
- Write at a level appropriate for: ${persona.grade}
- Body text uses \\n\\n between paragraphs (double newline)
- Return raw JSON only — no markdown, no code fences`

Parse and return the JSON as TextContent.
Throw a descriptive error if JSON parsing fails.
```

---

## PROMPT 8 — Slides Agent (with Unsplash Images)

```
In src/agents/slidesAgent.ts, implement:

export async function generateSlides(source: SourceContent, textContent: TextContent, persona: Persona): Promise<Slide[]>

Step 1 — Generate slide content with Gemini:

Build and send this prompt using callGeminiJSON:

`You are AMI. Generate exactly 6 presentation slides for a lesson on: ${source.topic}

The student is: ${persona.grade}, interested in: ${persona.interest}

Content outline (use this as the basis):
${textContent.toc.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}

Return a JSON array of slide objects. Each must have:
- "id": "slide_1" through "slide_6"
- "kind": one of: "cover" | "bullet" | "split" | "stat" | "equation"
- "title": string
- "narration": string (1-2 sentences of spoken narration for this slide)

Slide-specific fields:
- cover: add "subtitle": string
- bullet: add "points": string[] (exactly 4 bullet points)
- split: add "cards": [{ "label": string, "title": string, "body": string }, { ... }] (exactly 2 cards)
- stat: add "stat": string (a striking number or percentage), "caption": string
- equation: add "left": string (e.g. "CO₂ + H₂O + Light"), "operator": "→", "right": string (e.g. "Glucose + O₂")

Rules:
- Slide 1 must be kind "cover"
- Slide 6 must be kind "stat" with a fascinating fact about ${source.topic}
- No two consecutive slides can be the same kind
- Tailor narration to: ${persona.grade} reading level
- Return raw JSON array only`

Step 2 — Fetch an Unsplash image for each slide (except cover):
For each slide where kind !== 'cover':
  const query = `${source.topic} ${slide.title}`
  const imageUrl = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`
  Add imageUrl to the slide object.

For cover slide: imageUrl = null

Return the completed slides array.
Note: Unsplash Source API is free and needs no API key for basic usage.
```

---

## PROMPT 9 — Mindmap Agent

```
In src/agents/mindmapAgent.ts, implement:

export async function generateMindmap(textContent: TextContent): Promise<MindmapNode[]>

Use callGeminiJSON.

Build and send this prompt:

`Create a concept mindmap for the topic: ${textContent.title}

The main sections are:
${textContent.toc.map(t => `- ${t.title}`).join('\n')}

Return a JSON array of node objects with EXACTLY this structure:
[
  { "id": "root", "label": "${textContent.title}", "parent": null, "x": 0, "y": 0 },
  { "id": "n1", "label": "Main concept", "parent": "root", "x": -220, "y": -140 },
  { "id": "n1a", "label": "Sub concept", "parent": "n1", "x": -380, "y": -80 }
]

Layout rules:
- Root node is always at x: 0, y: 0
- Generate exactly 4 main branch nodes (children of root)
  - Position them at roughly: top-left, top-right, bottom-left, bottom-right
  - x range: ±180 to ±260, y range: ±120 to ±180
- Each main branch has 2-3 child nodes
  - Offset further from their parent in the same general direction
  - x adds ±120-160, y adds ±60-100
- Labels are short: 1-5 words maximum
- All IDs are unique strings (e.g. "root", "n1", "n2", "n1a", "n1b")
- x and y are integers, coordinate space is -600 to 600

Return raw JSON array only — no explanation, no markdown`

Parse and return as MindmapNode[].
```

---

## PROMPT 10 — Audio Script Agent

```
In src/agents/audioAgent.ts, implement:

export async function generateAudioScript(textContent: TextContent, persona: Persona): Promise<AudioContent>

Step 1 — Generate narration script using callGemini (plain text, not JSON):

Build and send this prompt:

`Write a conversational audio lesson script for: ${textContent.title}

Student level: ${persona.grade}
Student interest: ${persona.interest}

The script must:
- Open with a hook question that connects to ${persona.interest}
- Sound like a friendly, enthusiastic teacher talking directly to the student (use "you")
- Be 500-700 words total
- Include at least one analogy involving ${persona.interest}
- Cover these topics in order:
${textContent.toc.map((t, i) => `  ${i + 1}. ${t.title}`).join('\n')}

Mark chapter breaks exactly like this (the text inside is the chapter title):
[CHAPTER: Introduction]
... content ...
[CHAPTER: Next Chapter Name]
... content ...

End with a motivational closing line.
Do not include any stage directions, sound effects, or formatting — plain narration text only.`

Step 2 — Parse the script into chapters:
Split the returned text on /\[CHAPTER:\s*(.+?)\]/g
For each match, extract the chapter title and the text that follows it until the next [CHAPTER:] marker.

Return:
{
  title: `Audio Lesson: ${textContent.title}`,
  script: fullScriptText,
  chapters: [
    { title: "Introduction", timestamp: 0 },
    { title: "Chapter 2 Name", timestamp: 0 },
    ...
  ]
}

Timestamps are 0 for now. The frontend Web Speech API will read the script aloud;
real timestamps can be calculated later if needed.
```

---

## PROMPT 11 — LangGraph.js Orchestration Agent

```
Create src/agents/orchestrator.ts — the master agent that runs all sub-agents
in the correct order using LangGraph.js.

Import: import { StateGraph, END } from '@langchain/langgraph'

Define the graph state interface:
interface OrchestratorState {
  topic: string
  persona: Persona
  fromUpload: boolean
  source: SourceContent | null
  textContent: TextContent | null
  slides: Slide[] | null
  mindmap: MindmapNode[] | null
  audio: AudioContent | null
  error: string | null
}

Build the graph with these nodes:

Node "search":
  - If fromUpload is true, skip (source is pre-populated from the upload handler)
  - Otherwise call searchAndScrape(state.topic, state.persona)
  - Set state.source = result
  - On error: set state.error = error.message, go to END

Node "generate_text":
  - Call generateImmersiveText(state.source!, state.persona)
  - Set state.textContent = result

Node "parallel_generate":
  - Run these THREE in parallel using Promise.all:
    1. generateSlides(state.source!, state.textContent!, state.persona)
    2. generateMindmap(state.textContent!)
    3. generateAudioScript(state.textContent!, state.persona)
  - Set state.slides, state.mindmap, state.audio from results

Node "done":
  - Return state as-is (signals completion)

Wire the graph:
  search → generate_text → parallel_generate → done → END

Add conditional edge from "search":
  if state.error → END
  else → generate_text

Compile and export:
export const moduleOrchestrator = graph.compile()

Export a convenience function:
export async function runModuleGeneration(
  topic: string,
  persona: Persona,
  fromUpload = false,
  preloadedSource?: SourceContent
): Promise<Omit<OrchestratorState, 'error'>>

This function:
1. Invokes the graph with initial state
2. Throws if state.error is set
3. Returns the final state (all fields populated)
```

---

## PROMPT 12 — Modules Router (Generate + CRUD)

```
In src/routers/modules.ts, implement all module endpoints.
All endpoints require requireAuth middleware.

POST /api/modules/generate
  Body: { topic: string, persona: Persona }

  1. Call runModuleGeneration(topic, persona) from orchestrator.ts
  2. Build the module object (use Module interface from types/index.ts):
     {
       id: uuid(),
       userId: req.user.id,
       topic,
       persona,
       source: result.source,
       textContent: result.textContent,
       slides: result.slides,
       mindmap: result.mindmap,
       audio: result.audio,
       progress: 0,
       fromUpload: false,
       deadline: null,
       createdAt: new Date().toISOString()
     }
  3. Insert into Supabase modules table:
     supabase.from('modules').insert({
       id: module.id,
       user_id: module.userId,
       topic: module.topic,
       persona: module.persona,
       source: module.source,
       text_content: module.textContent,
       slides: module.slides,
       mindmap: module.mindmap,
       audio: module.audio,
       progress: 0,
       from_upload: false,
       deadline: null
     })
  4. Return the full module object as JSON

POST /api/modules/upload
  Body: multipart/form-data — files (PDF/images), persona (JSON string), deadline (string?)

  1. Validate each file is PDF or image (check mimetype)
  2. For PDFs: use pdf-parse to extract text
     import pdfParse from 'pdf-parse'
     const data = await pdfParse(file.data)
     → data.text
  3. For images: send to Gemini Vision:
     callGemini(`Extract all readable text from this image. Return plain text only:\n[image data]`)
     (pass the image buffer as a part in the Gemini multimodal request)
  4. Combine all extracted text, truncate to 8000 chars
  5. Build a SourceContent object:
     {
       topic: files[0].name.replace(/\.[^.]+$/, ''),
       sourceTitle: 'Uploaded material',
       sourceExcerpt: combinedText,
       sourceUrl: null
     }
  6. Call runModuleGeneration(topic, parsedPersona, true, source)
  7. Save and return the module (same as /generate above, with fromUpload: true, deadline: body.deadline)

GET /api/modules
  - Query: supabase.from('modules').select('id, topic, progress, from_upload, created_at').eq('user_id', req.user.id).order('created_at', { ascending: false })
  - Return the list

GET /api/modules/:id
  - Query: supabase.from('modules').select('*').eq('id', id).eq('user_id', req.user.id).single()
  - Return 404 if not found
  - Return full module

PUT /api/modules/:id/progress
  Body: { progress: number }  (0.0 to 1.0)
  - Update: supabase.from('modules').update({ progress: body.progress }).eq('id', id).eq('user_id', req.user.id)
  - Return: { success: true }

DELETE /api/modules/:id
  - Delete: supabase.from('modules').delete().eq('id', id).eq('user_id', req.user.id)
  - Return: { success: true }
```

---

## PROMPT 13 — RAG Chatbot with pgvector

```
In src/routers/chat.ts, implement the topic-locked chatbot with pgvector retrieval.

POST /api/chat/embed/:moduleId
  - Requires requireAuth middleware
  - Called once after a module is generated to create embeddings for RAG
  
  1. Fetch the module from Supabase (verify user owns it)
  2. Split textContent into chunks:
     - Each section body becomes one chunk
     - Each quiz question + choices becomes one chunk
     - Each slide's narration becomes one chunk
  3. For each chunk, generate an embedding using Google Generative AI:
     import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
     const embeddings = new GoogleGenerativeAIEmbeddings({
       apiKey: config.geminiKeys[0],
       modelName: 'embedding-001'
     })
     const vector = await embeddings.embedQuery(chunk)
  4. Insert into Supabase embeddings table:
     { module_id, chunk_text: chunk, embedding: vector, metadata: { source: 'text/slides/audio' } }
  5. Return: { success: true, chunksEmbedded: N }

POST /api/chat
  Body: { moduleId: string, message: string, history: ChatMessage[] }
  - Requires requireAuth middleware

  1. Fetch module from Supabase (verify ownership)
  2. Generate embedding for the user's message (same GoogleGenerativeAIEmbeddings as above)
  3. Call the match_embeddings Supabase function:
     supabase.rpc('match_embeddings', {
       query_embedding: messageEmbedding,
       match_module_id: moduleId,
       match_count: 5
     })
  4. Build context from the top 5 matched chunks
  5. Build the system prompt:
     `You are AMI, a focused AI tutor. Your ONLY job is to help the student understand: ${module.topic}

     Here is the relevant content from the student's study material:
     ${retrievedChunks.map(c => c.chunk_text).join('\n\n')}

     Rules:
     - Only answer questions directly related to ${module.topic}
     - If the student asks about something unrelated, politely say you can only discuss ${module.topic} in this session
     - Keep answers friendly and appropriate for: ${module.persona.grade}
     - Use analogies related to: ${module.persona.interest} when helpful
     - Be concise — 2-4 sentences unless a longer answer is clearly needed`

  6. Build conversation turns from history (last 10 messages max):
     [{ role: 'user', parts: [{ text: msg.content }] }, ...]
  7. Call Gemini with multi-turn chat:
     const chat = geminiModel.startChat({ history: conversationHistory, systemInstruction: systemPrompt })
     const result = await chat.sendMessage(message)
  8. Detect off-topic:
     const isOffTopic = result.response.text().toLowerCase().includes("i can only") ||
                        result.response.text().toLowerCase().includes("let's focus on")
  9. Return: { reply: result.response.text(), isOffTopic }
```

---

## PROMPT 14 — Error Handler + Global Middleware

```
In src/middleware/errorHandler.ts, implement a global Express error handler:

import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err)

  // Gemini quota error
  if (err.status === 429 || String(err).includes('429')) {
    return res.status(429).json({
      error: 'AI service is temporarily at capacity. Please try again in a moment.'
    })
  }

  // Supabase auth error
  if (err.message?.includes('JWT') || err.message?.includes('invalid token')) {
    return res.status(401).json({ error: 'Authentication failed. Please log in again.' })
  }

  // Validation error (missing fields)
  if (err.status === 400) {
    return res.status(400).json({ error: err.message || 'Invalid request.' })
  }

  // Default
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on our end. Please try again.'
  })
}

Also create a small helper for throwing HTTP errors cleanly:
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

Register it in src/index.ts as the last middleware:
app.use(errorHandler)
```

---

## PROMPT 15 — Wire Frontend to Backend

```
In the frontend (ami/frontend/src/), connect all existing pages to the real API.
Do NOT change any UI, styling, animations, or component structure.
Only add API calls and replace mock data.

Step 1 — Update vite.config.js proxy port:
Change the proxy target from localhost:8000 to localhost:3001

Step 2 — Create ami/frontend/src/services/api.js:

const BASE = '/api'

// Store token in memory (not localStorage)
let _token = null
export const setToken = (t) => { _token = t }
export const getToken = () => _token
export const clearToken = () => { _token = null }

const headers = () => ({
  'Content-Type': 'application/json',
  ...(_token ? { Authorization: `Bearer ${_token}` } : {})
})

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Auth
  register: (body) => req('POST', '/auth/register', body),
  login: (body) => req('POST', '/auth/login', body),
  googleAuth: (accessToken) => req('POST', '/auth/google', { accessToken }),
  logout: () => req('POST', '/auth/logout'),
  getMe: () => req('GET', '/auth/me'),
  updateMe: (body) => req('PUT', '/auth/me', body),
  deleteMe: () => req('DELETE', '/auth/me'),

  // Modules
  generateModule: (topic, persona) => req('POST', '/modules/generate', { topic, persona }),
  getModules: () => req('GET', '/modules'),
  getModule: (id) => req('GET', `/modules/${id}`),
  updateProgress: (id, progress) => req('PUT', `/modules/${id}/progress`, { progress }),
  deleteModule: (id) => req('DELETE', `/modules/${id}`),

  // Upload (multipart — uses fetch directly)
  uploadFiles: async (files, persona, deadline) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    form.append('persona', JSON.stringify(persona))
    if (deadline) form.append('deadline', deadline)
    const res = await fetch(`${BASE}/modules/upload`, {
      method: 'POST',
      headers: _token ? { Authorization: `Bearer ${_token}` } : {},
      body: form
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },

  // Chat
  embedModule: (moduleId) => req('POST', `/chat/embed/${moduleId}`),
  chat: (moduleId, message, history) => req('POST', '/chat', { moduleId, message, history }),
}

Step 3 — In App.jsx:
- Import { api, setToken, clearToken } from './services/api.js'
- In onLogin: call api.login({ email, password }), then setToken(data.token), setUser(data.user)
- In onLogout: call api.logout(), clearToken(), setUser(null)
- In onDeleteAccount: call api.deleteMe(), clearToken(), setUser(null)

Step 4 — In LoadingPage.jsx:
- Accept an onGenerate prop (async function passed from App.jsx)
- Replace the fake timer with: const result = await onGenerate()
- Call onDone(result) when the promise resolves
- Keep all animations running during the real async wait

Step 5 — In App.jsx startLearning():
- Pass an onGenerate function to LoadingPage:
  onGenerate = () => api.generateModule(topic, persona)
- Pass onGenerate to LoadingPage:
  <LoadingPage topic={topic} fromUpload={fromUpload} onGenerate={onGenerate} onDone={(module) => { setCurrentModule(module); setRoute('hub') }}/>
- Add useState: const [currentModule, setCurrentModule] = useState(null)

Step 6 — In LearningHub.jsx:
- Accept a module prop
- Replace all PHOTO_CONTENT references with module (same shape)
- Wire AIChatbot to use api.chat(module.id, message, history) instead of the mock response function

Step 7 — In DashboardPage.jsx:
- On mount (useEffect), call api.getModules() and store in state
- Replace HISTORY_ITEMS with the fetched list
- Map Supabase column names (snake_case) to the shape HistoryCard expects
```

---

## Implementation Order

Run prompts **1 → 15 in order**. Each depends on the one before it.

**Minimum for a working hackathon demo:** Prompts 1 → 5 (server + auth), 6 → 10 (all agents), 11 (orchestrator), 12 (modules router), 15 (frontend wiring). Skip 13 (RAG) and use the simple keyword-search chatbot already in the frontend until you have time to add it.

**What each prompt unlocks:**

| Prompts | Unlocks |
|---|---|
| 1–3 | Server boots, Supabase connected |
| 4 | Gemini calls work with key rotation |
| 5 | Auth endpoints live, login/register work |
| 6–10 | All 5 AI agents generate real content |
| 11 | Full orchestration — one call generates everything |
| 12 | `/api/modules/generate` and CRUD work end-to-end |
| 13 | RAG chatbot with semantic search |
| 14 | Error handling is production-ready |
| 15 | Frontend talks to real backend, mock data gone |
