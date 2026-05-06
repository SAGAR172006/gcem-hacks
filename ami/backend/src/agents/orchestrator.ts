import { Persona, SourceContent, TextContent, Slide, MindmapNode, AudioContent, MasterContext } from '../types';
import { searchAndScrape } from './searchAgent';
import { generateMasterContext } from './leadAgent';
import { generateImmersiveText } from './textAgent';
import { generateSlides } from './slidesAgent';
import { buildMindmapFromContext } from './mindmapAgent';
import { buildAudioFromTextContent } from './audioAgent';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OrchestratorState {
  topic: string;
  persona: Persona;
  fromUpload: boolean;
  source: SourceContent | null;
  masterContext: MasterContext | null;
  textContent: TextContent | null;
  slides: Slide[] | null;
  mindmap: MindmapNode[] | null;
  audio: AudioContent | null;
  error: string | null;
}

// ── Hub and Spoke Orchestrator ─────────────────────────────────────────────────
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │  Phase 1 (~18s)                                                     │
// │  1. searchAndScrape  → SourceContent (search + scrape, no Gemini)  │
// │  2. leadAgent        → MasterContext (1 Gemini call, compresses     │
// │                         raw source into ~400-token JSON)            │
// └──────────────────────────────┬──────────────────────────────────────┘
//                                │ MasterContext passed to all workers
// ┌──────────────────────────────▼──────────────────────────────────────┐
// │  Phase 2 — Parallel workers with 1s stagger (~10-15s)               │
// │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐  │
// │  │ textAgent   │  │ slidesAgent  │  │mindmapAgent│  │audioAgent│  │
// │  │ (1 call)    │  │ (1 call)     │  │ (0 calls)  │  │ (0 calls)│  │
// │  └─────────────┘  └──────────────┘  └────────────┘  └──────────┘  │
// │  Total Phase 2 Gemini calls: 2 (text + slides)                      │
// └─────────────────────────────────────────────────────────────────────┘
//
// Previous token cost: ~21,000 input tokens (7 calls × 3,000 tokens each)
// New token cost:      ~1,200 input tokens  (1 lead + 1 text + 1 slides)
// Savings:             ~94% reduction in Gemini input token usage

/**
 * Phase 1 — Fast path. Returns in ~15-20s.
 * Runs search + Lead Agent. Returns source + masterContext.
 * The frontend can show an interim "generating" state while Phase 2 runs.
 */
export async function runPhase1(
  topic: string,
  persona: Persona,
  fromUpload = false,
  preloadedSource?: SourceContent
): Promise<{ source: SourceContent; masterContext: MasterContext }> {
  // Step 1: Get source (search the web or use uploaded content)
  let source: SourceContent;
  if (preloadedSource) {
    source = preloadedSource;
  } else {
    console.log('[Orchestrator] Phase 1: Searching for source content...');
    source = await searchAndScrape(topic, persona);
  }

  // Step 2: Lead Agent — compress source into Master Context (1 Gemini call)
  console.log('[Orchestrator] Phase 1: Lead Agent generating Master Context...');
  const masterContext = await generateMasterContext(source, persona);

  return { source, masterContext };
}

/**
 * Phase 2 — Background generation. Runs after frontend has loaded Phase 1 data.
 * Fires text + slides agents simultaneously (staggered 1s apart) against MasterContext.
 * Mindmap and audio are built locally (zero Gemini calls).
 */
export async function runPhase2(
  source: SourceContent,
  masterContext: MasterContext,
  persona: Persona
): Promise<{ textContent: TextContent; slides: Slide[]; mindmap: MindmapNode[]; audio: AudioContent }> {

  console.log('[Orchestrator] Phase 2: Firing worker agents in parallel...');

  // Mindmap is built instantly from MasterContext — no wait needed
  console.log('[Orchestrator] Phase 2: Building mindmap from Master Context (no AI call)...');
  const mindmap = buildMindmapFromContext(masterContext);

  // Text fires immediately (primary key pool).
  // Slides fires 3s later (secondary key pool — completely separate keys).
  // The stagger is just extra safety; the pool split already prevents racing.
  const textPromise = generateImmersiveText(masterContext, persona);

  await sleep(3000); // 3s stagger — gives primary pool time to settle

  const slidesPromise = generateSlides(masterContext, persona);

  // Wait for both to complete
  const [textContent, slides] = await Promise.all([textPromise, slidesPromise]);

  // Audio is built from the completed textContent prose (zero Gemini calls)
  console.log('[Orchestrator] Phase 2: Building audio from text content (no AI call)...');
  const audio = buildAudioFromTextContent(textContent);

  return { textContent, slides, mindmap, audio };
}

/**
 * Full pipeline (used for background job after module row is created).
 */
export async function runModuleGeneration(
  topic: string,
  persona: Persona,
  fromUpload = false,
  preloadedSource?: SourceContent
): Promise<Omit<OrchestratorState, 'error'>> {
  const { source, masterContext } = await runPhase1(topic, persona, fromUpload, preloadedSource);
  const { textContent, slides, mindmap, audio } = await runPhase2(source, masterContext, persona);

  return {
    topic,
    persona,
    fromUpload,
    source,
    masterContext,
    textContent,
    slides,
    mindmap,
    audio,
  };
}
