import { StateGraph, START, END } from '@langchain/langgraph';
import { Persona, SourceContent, TextContent, Slide, MindmapNode, AudioContent } from '../types';
import { searchAndScrape } from './searchAgent';
import { generateImmersiveText } from './textAgent';
import { generateSlides } from './slidesAgent';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const AGENT_GAP_MS = 2000;

export interface OrchestratorState {
  topic: string;
  persona: Persona;
  fromUpload: boolean;
  source: SourceContent | null;
  textContent: TextContent | null;
  slides: Slide[] | null;
  mindmap: MindmapNode[] | null;
  audio: AudioContent | null;
  error: string | null;
}

const orchestratorStateChannels = {
  topic: { value: (a: string, b: string) => b ?? a, default: () => "" },
  persona: { value: (a: Persona, b: Persona) => b ?? a, default: () => null as unknown as Persona },
  fromUpload: { value: (a: boolean, b: boolean) => b ?? a, default: () => false },
  source: { value: (a: SourceContent | null, b: SourceContent | null) => b ?? a, default: () => null },
  textContent: { value: (a: TextContent | null, b: TextContent | null) => b ?? a, default: () => null },
  slides: { value: (a: Slide[] | null, b: Slide[] | null) => b ?? a, default: () => null },
  mindmap: { value: (a: MindmapNode[] | null, b: MindmapNode[] | null) => b ?? a, default: () => null },
  audio: { value: (a: AudioContent | null, b: AudioContent | null) => b ?? a, default: () => null },
  error: { value: (a: string | null, b: string | null) => b ?? a, default: () => null }
};

const graph = new StateGraph<OrchestratorState, any, any>({ channels: orchestratorStateChannels });

graph.addNode("search", async (state: OrchestratorState) => {
  if (state.fromUpload) return {};
  try {
    const source = await searchAndScrape(state.topic, state.persona);
    return { source };
  } catch (error: any) {
    return { error: error.message };
  }
});

graph.addNode("generate_text", async (state: OrchestratorState) => {
  try {
    const textContent = await generateImmersiveText(state.source!, state.persona);
    return { textContent };
  } catch (error: any) {
    return { error: error.message };
  }
});

graph.addNode("generate_secondary", async (state: OrchestratorState) => {
  try {
    console.log('[Orchestrator] Generating slides...');
    const slides = await generateSlides(state.source!, state.textContent!, state.persona);
    await sleep(AGENT_GAP_MS);

    console.log('[Orchestrator] Building mindmap from TOC (no AI call)...');
    const mindmap = buildMindmapFromTOC(state.textContent!);

    console.log('[Orchestrator] Building audio script from prose (no AI call)...');
    const audio = buildAudioFromProse(state.textContent!);

    return { slides, mindmap, audio };
  } catch (error: any) {
    return { error: error.message };
  }
});

graph.addNode("done", (_state: OrchestratorState) => ({}));

graph.addEdge(START, "search");
graph.addConditionalEdges("search", (state: OrchestratorState) => {
  if (state.error) return "error";
  return "success";
}, { error: END, success: "generate_text" });
graph.addConditionalEdges("generate_text", (state: OrchestratorState) => {
  if (state.error) return "error";
  return "success";
}, { error: END, success: "generate_secondary" });
graph.addEdge("generate_secondary", "done");
graph.addEdge("done", END);

export const moduleOrchestrator = graph.compile();

export async function runModuleGeneration(
  topic: string,
  persona: Persona,
  fromUpload = false,
  preloadedSource?: SourceContent
): Promise<Omit<OrchestratorState, 'error'>> {
  const initialState: OrchestratorState = {
    topic, persona, fromUpload,
    source: preloadedSource || null,
    textContent: null, slides: null, mindmap: null, audio: null, error: null
  };
  const finalState = await moduleOrchestrator.invoke(initialState);
  if (finalState.error) throw new Error(finalState.error);
  return finalState;
}

// Phase 1: search + text only — fast, returns in ~15s
export async function runPhase1(
  topic: string,
  persona: Persona,
  fromUpload = false,
  preloadedSource?: SourceContent
): Promise<{ source: SourceContent; textContent: TextContent }> {
  let source: SourceContent;
  if (preloadedSource) {
    source = preloadedSource;
  } else {
    source = await searchAndScrape(topic, persona);
  }
  const textContent = await generateImmersiveText(source, persona);
  return { source, textContent };
}

// Phase 2: slides only (1 Gemini call) + mindmap + audio built locally (0 calls)
export async function runPhase2(
  source: SourceContent,
  textContent: TextContent,
  persona: Persona
): Promise<{ slides: Slide[]; mindmap: MindmapNode[]; audio: AudioContent }> {
  console.log('[Orchestrator] Phase 2: slides (1 Gemini call)...');
  const slides = await generateSlides(source, textContent, persona);

  console.log('[Orchestrator] Phase 2: mindmap from TOC (no AI call)...');
  const mindmap = buildMindmapFromTOC(textContent);

  console.log('[Orchestrator] Phase 2: audio script from prose (no AI call)...');
  const audio = buildAudioFromProse(textContent);

  return { slides, mindmap, audio };
}

// ── Local builders (zero Gemini calls) ───────────────────────────────────────

function buildMindmapFromTOC(textContent: TextContent): MindmapNode[] {
  // Fixed quadrant positions for up to 4 TOC sections
  const positions = [
    { x: -240, y: -150 },
    { x:  240, y: -150 },
    { x: -240, y:  150 },
    { x:  240, y:  150 },
  ];

  const nodes: MindmapNode[] = [
    { id: 'root', label: textContent.title, parent: null, x: 0, y: 0 }
  ];

  textContent.toc.forEach((section, i) => {
    const pos = positions[i] || { x: (i % 2 === 0 ? -240 : 240), y: (i < 2 ? -150 : 150) };
    const nodeId = 'n' + (i + 1);
    nodes.push({ id: nodeId, label: section.title, parent: 'root', x: pos.x, y: pos.y });

    // Add 2 sub-nodes per section derived from the section title words
    const words = section.title.split(' ');
    const sub1 = words.slice(0, Math.ceil(words.length / 2)).join(' ') || section.title;
    const sub2 = words.slice(Math.ceil(words.length / 2)).join(' ') || 'Details';
    const subOffsetX = pos.x < 0 ? -130 : 130;

    nodes.push({ id: nodeId + 'a', label: sub1, parent: nodeId, x: pos.x + subOffsetX, y: pos.y - 60 });
    nodes.push({ id: nodeId + 'b', label: sub2, parent: nodeId, x: pos.x + subOffsetX, y: pos.y + 60 });
  });

  return nodes;
}

function buildAudioFromProse(textContent: TextContent): AudioContent {
  // Collect prose sections to build script
  const proseBlocks = textContent.sections.filter((s: any) => s.kind === 'prose');
  const objectives = textContent.sections.find((s: any) => s.kind === 'objectives');

  let script = 'Welcome to this audio lesson on ' + textContent.title + '.\n\n';

  if (objectives && objectives.items && objectives.items.length > 0) {
    script += '[CHAPTER: Introduction]\n';
    script += 'By the end of this lesson, you will be able to: ';
    script += objectives.items.join('; ') + '.\n\n';
  }

  proseBlocks.forEach((section: any, i: number) => {
    script += '[CHAPTER: ' + (section.heading || ('Part ' + (i + 1))) + ']\n';
    if (section.body) {
      // Strip markdown bold markers for clean audio text
      script += section.body.replace(/\*\*(.+?)\*\*/g, '$1') + '\n\n';
    }
  });

  script += '[CHAPTER: Summary]\n';
  script += 'Great work making it through ' + textContent.title + '. ';
  script += 'Remember the key points from each section as you continue your learning journey.\n';

  // Build chapters from [CHAPTER:] markers
  const parts = script.split(/\[CHAPTER:\s*(.+?)\]/g);
  const chapters: { title: string; timestamp: number }[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    chapters.push({ title: parts[i].trim(), timestamp: 0 });
  }

  if (chapters.length === 0) {
    chapters.push({ title: 'Introduction', timestamp: 0 });
  }

  return {
    title: 'Audio Lesson: ' + textContent.title,
    script,
    chapters
  };
}
