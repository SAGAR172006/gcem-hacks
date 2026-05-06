import { MasterContext, Persona, TextContent } from '../types';
import { callGeminiJSON } from '../services/gemini';
import { serializeMasterContext } from './leadAgent';

/**
 * Text Agent — Hub and Spoke, Phase 2 Worker.
 *
 * Receives the lightweight MasterContext (~400 tokens) from the orchestrator.
 * Makes ONE Gemini call that expands it into the full immersive text module:
 * objectives block + 4 prose sections + 4 inline quizzes + title/subtitle.
 *
 * Previously: 7 sequential Gemini calls (~3,000 tokens input each = ~21,000 total input tokens)
 * Now:        1 Gemini call (~600 tokens input = ~600 total input tokens)
 * Savings:    ~97% reduction in input tokens for this agent.
 */
export async function generateImmersiveText(
  masterCtx: MasterContext,
  persona: Persona
): Promise<TextContent> {
  const contextBlock = serializeMasterContext(masterCtx);

  const prompt = [
    'You are AMI, a hyper-personalized educational AI.',
    'Student level: ' + persona.grade,
    'Student interest: ' + persona.interest,
    (persona.adaptiveContext ? 'Adaptive context: ' + persona.adaptiveContext : ''),
    '',
    'You have been given a distilled Master Context for the topic: ' + masterCtx.topic,
    '',
    '=== MASTER CONTEXT ===',
    contextBlock,
    '=== END MASTER CONTEXT ===',
    '',
    'Using ONLY the Master Context above, generate a complete learning module.',
    'The 4 sections MUST follow the TOC order listed in the context.',
    '',
    'Output STRICTLY as raw JSON (no markdown, no code blocks):',
    '{',
    '  "title": "Engaging module title",',
    '  "subtitle": "One sentence subtitle",',
    '  "toc": [',
    '    { "id": "s1", "title": "Section 1 title", "done": false, "current": true },',
    '    { "id": "s2", "title": "Section 2 title", "done": false, "current": false },',
    '    { "id": "s3", "title": "Section 3 title", "done": false, "current": false },',
    '    { "id": "s4", "title": "Section 4 title", "done": false, "current": false }',
    '  ],',
    '  "sections": [',
    '    {',
    '      "id": "obj",',
    '      "kind": "objectives",',
    '      "heading": "What you\'ll learn",',
    '      "items": ["learning outcome 1", "learning outcome 2", "learning outcome 3"]',
    '    },',
    '    {',
    '      "id": "p1",',
    '      "kind": "prose",',
    '      "heading": "Section 1 title",',
    '      "body": "2-3 paragraphs. Use **bold** for key terms. Use analogies related to: ' + persona.interest + '."',
    '    },',
    '    {',
    '      "id": "q1",',
    '      "kind": "inline-quiz",',
    '      "question": "Question about section 1?",',
    '      "hint": "Helpful hint",',
    '      "choices": [',
    '        { "id": "a", "text": "Option A", "correct": false },',
    '        { "id": "b", "text": "Correct option", "correct": true },',
    '        { "id": "c", "text": "Option C", "correct": false },',
    '        { "id": "d", "text": "Option D", "correct": false }',
    '      ]',
    '    },',
    '    // ... repeat prose + quiz pattern for sections 2, 3, 4 (p2/q2, p3/q3, p4/q4)',
    '  ]',
    '}',
    '',
    'Rules:',
    '- sections array: [objectives, p1, q1, p2, q2, p3, q3, p4, q4] — exactly 9 items',
    '- Every quiz: exactly 4 choices, exactly 1 marked correct:true',
    '- Prose bodies: 2-3 paragraphs, separated by \\n\\n, use **bold** for key terms',
    '- Section titles in toc must match the heading values in prose sections',
    '- Write at the ' + persona.grade + ' level. Be engaging, not textbook-dry.',
    '- Base ALL content on the Master Context. Do not invent facts outside it.',
    '- Return raw JSON only. No text before or after the JSON object.',
  ].filter(Boolean).join('\n');

  try {
    console.log('[TextAgent] Expanding Master Context into full module (1 Gemini call)...');
    const result = await callGeminiJSON<TextContent>(prompt);

    // Defensive: ensure toc has done/current fields
    if (Array.isArray(result.toc)) {
      result.toc = result.toc.map((item: any, i: number) => ({
        id: item.id || ('s' + (i + 1)),
        title: item.title || masterCtx.toc[i] || ('Section ' + (i + 1)),
        done: false,
        current: i === 0,
      }));
    } else {
      result.toc = masterCtx.toc.map((title, i) => ({
        id: 's' + (i + 1),
        title,
        done: false,
        current: i === 0,
      }));
    }

    // Defensive: ensure sections is an array
    if (!Array.isArray(result.sections)) {
      throw new Error('sections missing from Gemini response');
    }

    console.log('[TextAgent] Done — ' + result.sections.length + ' sections generated');
    return result;
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      throw new Error('[TextAgent] Failed to parse JSON response: ' + err.message);
    }
    throw new Error('[TextAgent] Failed to generate immersive text: ' + err.message);
  }
}
