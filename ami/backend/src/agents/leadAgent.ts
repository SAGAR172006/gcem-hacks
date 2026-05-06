import { SourceContent, Persona, MasterContext } from '../types';
import { callGeminiJSON } from '../services/gemini';

/**
 * Lead Agent — Phase 1, Step 2.
 *
 * Takes the raw source text (up to 4,000 tokens) and compresses it into a
 * lightweight MasterContext JSON (~400 tokens). Every downstream worker agent
 * receives only this JSON — the raw source is never sent again.
 *
 * One Gemini call. ~3-5 seconds. Saves 70-80% of input tokens across the pipeline.
 */
export async function generateMasterContext(
  source: SourceContent,
  persona: Persona
): Promise<MasterContext> {
  const prompt = [
    'You are an expert educational content synthesizer.',
    'Your job: read the source material below and distill it into a structured Master Context JSON.',
    'Remove all fluff, repetition, and low-value text. Keep only core knowledge.',
    '',
    'Topic: ' + source.topic,
    'Student level: ' + persona.grade,
    'Student interest: ' + persona.interest,
    (persona.adaptiveContext ? 'Adaptive context: ' + persona.adaptiveContext : ''),
    '',
    '--- SOURCE MATERIAL ---',
    source.sourceExcerpt.slice(0, 4000),
    '--- END SOURCE ---',
    '',
    'Output STRICTLY as raw JSON (no markdown, no code blocks):',
    '{',
    '  "topic": "' + source.topic + '",',
    '  "oneLiner": "One precise sentence that defines this topic",',
    '  "coreConcepts": [',
    '    {',
    '      "term": "Key concept name",',
    '      "definition": "One precise definitional sentence",',
    '      "relatedTerms": ["related term 1", "related term 2"]',
    '    }',
    '    // 5 to 8 concepts total',
    '  ],',
    '  "keyFacts": [',
    '    "Standalone fact 1 (a crisp, memorable, concrete statement)",',
    '    "Standalone fact 2",',
    '    "Standalone fact 3",',
    '    "Standalone fact 4",',
    '    "Standalone fact 5"',
    '    // 5 to 7 facts total',
    '  ],',
    '  "toc": [',
    '    "Section 1 title",',
    '    "Section 2 title",',
    '    "Section 3 title",',
    '    "Section 4 title"',
    '  ],',
    '  "imageKeywords": [',
    '    "keyword1", "keyword2", "keyword3", "keyword4", "keyword5"',
    '    // One specific concrete noun per keyword — good for Unsplash image search',
    '  ]',
    '}',
    '',
    'Rules:',
    '- coreConcepts: 5-8 items, each with a clear definition and 2-3 related terms',
    '- keyFacts: 5-7 items, each a standalone sentence a student could memorize',
    '- toc: exactly 4 section titles in logical learning order',
    '- imageKeywords: exactly 5 specific nouns (e.g. "telescope" not "space exploration")',
    '- Output raw JSON only. Absolutely no markdown or prose outside the JSON.',
  ].filter(Boolean).join('\n');

  try {
    console.log('[LeadAgent] Generating Master Context for: ' + source.topic);
    const ctx = await callGeminiJSON<MasterContext>(prompt);

    // Ensure required arrays are present (defensive)
    if (!Array.isArray(ctx.coreConcepts)) ctx.coreConcepts = [];
    if (!Array.isArray(ctx.keyFacts)) ctx.keyFacts = [];
    if (!Array.isArray(ctx.toc) || ctx.toc.length < 4) {
      ctx.toc = ctx.toc?.length ? ctx.toc : [
        'Introduction to ' + source.topic,
        'Core Mechanisms',
        'Key Processes',
        'Real-World Applications',
      ];
    }
    if (!Array.isArray(ctx.imageKeywords)) ctx.imageKeywords = [source.topic];

    console.log('[LeadAgent] Master Context ready — ' + ctx.coreConcepts.length + ' concepts, ' + ctx.keyFacts.length + ' facts');
    return ctx;
  } catch (err: any) {
    throw new Error('[LeadAgent] Failed to generate Master Context: ' + err.message);
  }
}

/** Serialize MasterContext to a compact string for injection into worker prompts */
export function serializeMasterContext(ctx: MasterContext): string {
  const lines: string[] = [
    'TOPIC: ' + ctx.topic,
    'SUMMARY: ' + ctx.oneLiner,
    '',
    'CORE CONCEPTS:',
    ...ctx.coreConcepts.map(c =>
      '- ' + c.term + ': ' + c.definition +
      (c.relatedTerms.length > 0 ? ' (related: ' + c.relatedTerms.join(', ') + ')' : '')
    ),
    '',
    'KEY FACTS:',
    ...ctx.keyFacts.map(f => '• ' + f),
    '',
    'LEARNING SECTIONS (in order):',
    ...ctx.toc.map((t, i) => (i + 1) + '. ' + t),
  ];
  return lines.join('\n');
}
