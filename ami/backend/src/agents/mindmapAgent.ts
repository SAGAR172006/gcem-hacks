import { TextContent, MindmapNode } from '../types';
import { callGeminiJSON } from '../services/gemini';

export async function generateMindmap(textContent: TextContent): Promise<MindmapNode[]> {
  const prompt = `Create a concept mindmap for the topic: ${textContent.title}

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

Return raw JSON array only — no explanation, no markdown`;

  try {
    return await callGeminiJSON<MindmapNode[]>(prompt);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Mindmap JSON from Gemini response: ${error.message}`);
    }
    throw new Error(`Failed to generate mindmap: ${error.message}`);
  }
}
