import { Persona, TextContent } from '../types';
import { callGeminiJSON } from '../services/gemini';
import { buildAudioFromTextContent } from './audioAgent';

/**
 * Generates custom learning content (Immersive Text, Mind Map, Audio Script)
 * directly from the extracted learning pointers of the custom syllabus / questions.
 */
export async function generateImmersiveTextFromPointers(
  topic: string,
  pointers: string[],
  persona: Persona
): Promise<TextContent> {
  const cleanedPointers = pointers.filter(p => p && p.trim().length > 0);
  const prompt = `
You are AMI, a hyper-personalized educational AI.
Student Grade: ${persona.grade}
Student Interest: ${persona.interest}
${persona.adaptiveContext ? `Adaptive Context: ${persona.adaptiveContext}` : ''}

You are given a list of key learning pointers for the topic: "${topic}".
Pointers:
${cleanedPointers.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}

Generate a custom learning module based on these pointers.
For each pointer, you MUST create:
1. A TOC section.
2. A prose explanation section (under s.kind = "prose") that explains the pointer in detail, using analogies related to the student's interest: "${persona.interest}". Format the prose body as a list of 2-4 descriptive bullet points, starting with a bullet point character '• ' and separated by '\\n\\n' (two newlines). Use **bold** for key terms.
3. An inline quiz (under s.kind = "inline-quiz") that tests the student on that specific pointer. The quiz must have exactly 4 choices and exactly 1 correct answer. Include a helpful hint.

Rules:
- DO NOT generate or reference any figures, diagrams, or images in any sections.
- The module MUST have exactly ${cleanedPointers.length} sections, matching the pointers.
- Structure of the sections: [objectives, p1, q1, p2, q2, ...] - objectives is first, then a prose and inline quiz for each pointer.
- Section IDs must be structured as:
  - TOC items: "s1", "s2", "s3", ...
  - Prose section IDs: "s1-prose", "s2-prose", "s3-prose", ...
  - Inline quiz IDs: "s1-quiz", "s2-quiz", "s3-quiz", ...
- The Objectives section (id: "obj") must have heading "Learning Objectives" and outline the key goals based on the pointers.

Output strictly as a valid JSON object matching this schema:
{
  "title": "Engaging Module Title",
  "subtitle": "A one-sentence subtitle introducing the lesson",
  "toc": [
    { "id": "s1", "title": "Brief Short Title for Pointer 1", "done": false, "current": true },
    { "id": "s2", "title": "Brief Short Title for Pointer 2", "done": false, "current": false }
    // ...
  ],
  "sections": [
    {
      "id": "obj",
      "kind": "objectives",
      "heading": "Learning Objectives",
      "items": ["Outcome 1", "Outcome 2", ...]
    },
    {
      "id": "s1-prose",
      "kind": "prose",
      "heading": "Full Heading for Pointer 1",
      "body": "• Key explanation bullet 1\\n\\n• Key explanation bullet 2"
    },
    {
      "id": "s1-quiz",
      "kind": "inline-quiz",
      "question": "Multiple choice question testing pointer 1?",
      "hint": "Helpful hint related to pointer 1",
      "choices": [
        { "id": "a", "text": "Option A text", "correct": false },
        { "id": "b", "text": "Option B text", "correct": true },
        { "id": "c", "text": "Option C text", "correct": false },
        { "id": "d", "text": "Option D text", "correct": false }
      ]
    }
    // ... repeat for all other pointers
  ]
}
`;

  console.log(`[PointersAgent] Generating immersive text from ${cleanedPointers.length} pointers...`);
  const result = await callGeminiJSON<TextContent>(prompt);

  // Defensive: check and format TOC items
  if (result.toc && Array.isArray(result.toc)) {
    result.toc = result.toc.map((item: any, i: number) => ({
      id: item.id || `s${i + 1}`,
      title: item.title || `Section ${i + 1}`,
      done: false,
      current: i === 0
    }));
  }

  return result;
}

/**
 * Builds a beautiful mindmap graph programmatically from the custom pointers' prose body.
 * Fans out concept nodes from Root, and sub-nodes from the bolded key terms in explanation bullets.
 */
export function buildMindmapFromPointers(topic: string, textContent: TextContent): any[] {
  const nodes: any[] = [];
  
  // Root node at center
  nodes.push({ id: 'root', label: topic, parent: null, x: 0, y: 0 });

  const toc = textContent.toc || [];
  const count = toc.length;

  const RING_RADIUS = 260;
  const SUB_RADIUS = 140;

  toc.forEach((item, i) => {
    // Angle in radians, spread evenly around a circle
    const angle = ((2 * Math.PI) / count) * i - Math.PI / 2;
    const cx = Math.round(Math.cos(angle) * RING_RADIUS);
    const cy = Math.round(Math.sin(angle) * RING_RADIUS);

    const nodeId = item.id;
    nodes.push({
      id: nodeId,
      label: item.title,
      parent: 'root',
      x: cx,
      y: cy,
    });

    // Find corresponding prose explanation section
    const prose = textContent.sections.find(s => s.id === `${nodeId}-prose`);
    if (prose && prose.body) {
      const bullets = prose.body.split('\n\n')
        .map(b => b.replace(/[•\s*-]+/g, '').trim())
        .filter(Boolean)
        .slice(0, 3); // Max 3 sub-nodes per concept

      bullets.forEach((bulletText, j) => {
        let label = bulletText;
        // Prefer bolded key terms as short labels
        const boldMatch = bulletText.match(/\*\*(.+?)\*\*/);
        if (boldMatch) {
          label = boldMatch[1];
        } else {
          const words = bulletText.split(' ');
          if (words.length > 4) {
            label = words.slice(0, 4).join(' ') + '...';
          }
        }

        const spreadAngle = angle + ((j - (bullets.length - 1) / 2) * 0.45);
        const sx = Math.round(cx + Math.cos(spreadAngle) * SUB_RADIUS);
        const sy = Math.round(cy + Math.sin(spreadAngle) * SUB_RADIUS);

        nodes.push({
          id: `${nodeId}s${j}`,
          label: label,
          parent: nodeId,
          x: sx,
          y: sy,
        });
      });
    }
  });

  return nodes;
}

/**
 * Builds the complete set of learning materials from custom pointers.
 */
export async function buildModuleMaterialsFromPointers(
  topic: string,
  pointers: string[],
  persona: Persona
): Promise<{ textContent: TextContent; mindmap: any[]; audio: any }> {
  const textContent = await generateImmersiveTextFromPointers(topic, pointers, persona);
  const mindmap = buildMindmapFromPointers(topic, textContent);
  const audio = buildAudioFromTextContent(textContent);

  return { textContent, mindmap, audio };
}

/**
 * Extracts pointers from raw sourceText and uses them to build custom materials.
 */
export async function buildMaterialsFromSourceText(
  topic: string,
  sourceText: string,
  persona: Persona
): Promise<{ textContent: TextContent; mindmap: any[]; audio: any; pointers: string[] }> {
  console.log(`[PointersAgent] Extracting 5 key learning pointers from source text for topic: "${topic}"...`);
  let pointers: string[] = [];
  try {
    const extractPrompt = `
Analyze this text/syllabus excerpt and extract exactly 5 key, descriptive learning pointers (each as a single clear sentence summarizing a core concept).
Source Text:
${sourceText.slice(0, 4000)}

Output strictly as a valid JSON array of strings:
["Pointer 1", "Pointer 2", ...]
`;
    const extracted = await callGeminiJSON<string[]>(extractPrompt);
    if (Array.isArray(extracted) && extracted.length > 0) {
      pointers = extracted.filter(Boolean);
    }
  } catch (e: any) {
    console.warn('[PointersAgent] Failed to extract pointers from sourceText:', e.message);
  }

  // Fallback if extraction failed
  if (pointers.length === 0) {
    pointers = [
      `Understand the fundamental concepts of ${topic}.`,
      `Analyze the key principles and structures of ${topic}.`,
      `Evaluate the processes and mechanisms involved in ${topic}.`,
      `Apply theoretical knowledge of ${topic} to practical scenarios.`,
      `Synthesize the broad impacts and implications of ${topic}.`
    ];
  }

  const materials = await buildModuleMaterialsFromPointers(topic, pointers, persona);
  return { ...materials, pointers };
}

