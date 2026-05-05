import { SourceContent, Persona, TextContent } from '../types';
import { callGeminiJSON } from '../services/gemini';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const CALL_GAP_MS = 1500; // 1.5s between each Gemini call

function personaBlock(persona: Persona): string {
  const base = 'Student level: ' + persona.grade + '\nStudent interest: ' + persona.interest;
  if (persona.adaptiveContext) {
    return base + '\nAdaptive context: ' + persona.adaptiveContext;
  }
  return base;
}


async function generateTOC(source: SourceContent, persona: Persona): Promise<{ id: string; title: string }[]> {
  const lines = [
    'You are AMI, a hyper-personalized educational AI.',
    '',
    'Topic: ' + source.topic,
    ...personaBlock(persona).split('\n'),
    '',
    'Based on the following source material, generate exactly 4 section titles that cover the topic logically.',
    'Return a JSON array ONLY - no markdown, no code blocks:',
    '[',
    '  { "id": "s1", "title": "..." },',
    '  { "id": "s2", "title": "..." },',
    '  { "id": "s3", "title": "..." },',
    '  { "id": "s4", "title": "..." }',
    ']',
    '',
    'Source material (excerpt):',
    source.sourceExcerpt.slice(0, 3000),
  ];
  return await callGeminiJSON<{ id: string; title: string }[]>(lines.join('\n'));
}

async function generateObjectives(source: SourceContent, persona: Persona): Promise<any> {
  const lines = [
    'You are AMI, a hyper-personalized educational AI.',
    'Topic: ' + source.topic,
    ...personaBlock(persona).split('\n'),
    '',
    'Generate a learning objectives block. Return JSON only:',
    '{',
    '  "id": "obj1",',
    '  "kind": "objectives",',
    '  "heading": "What you\'ll learn",',
    '  "items": ["outcome 1", "outcome 2", "outcome 3"]',
    '}',
  ];
  return await callGeminiJSON<any>(lines.join('\n'));
}

async function generateSection(
  source: SourceContent,
  persona: Persona,
  sectionTitle: string,
  sectionIndex: number
): Promise<{ prose: any; quiz: any }> {
  const num = sectionIndex + 1;
  const proseId = 'p' + String(num);
  const quizId = 'q' + String(num);

  const lines = [
    'You are AMI, a hyper-personalized educational AI.',
    'Topic: ' + source.topic,
    ...personaBlock(persona).split('\n'),
    'Section ' + String(num) + ' of 4: ' + sectionTitle,
    '',
    'Source (excerpt):',
    source.sourceExcerpt.slice(0, 2500),
    '',
    'Generate a prose block and inline quiz. Return JSON only:',
    '{',
    '  "prose": {',
    '    "id": "' + proseId + '",',
    '    "kind": "prose",',
    '    "heading": "' + sectionTitle + '",',
    '    "body": "2-3 paragraphs with **bold** key terms. Use analogies about ' + persona.interest + '."',
    '  },',
    '  "quiz": {',
    '    "id": "' + quizId + '",',
    '    "kind": "inline-quiz",',
    '    "question": "Question about ' + sectionTitle + '?",',
    '    "hint": "Helpful hint",',
    '    "choices": [',
    '      { "id": "a", "text": "Wrong", "correct": false },',
    '      { "id": "b", "text": "Correct", "correct": true },',
    '      { "id": "c", "text": "Wrong", "correct": false },',
    '      { "id": "d", "text": "Wrong", "correct": false }',
    '    ]',
    '  }',
    '}',
    'Rules: exactly 4 choices, exactly 1 correct. Write for level: ' + persona.grade,
  ];
  return await callGeminiJSON<{ prose: any; quiz: any }>(lines.join('\n'));
}

async function generateTitleSubtitle(topic: string): Promise<{ title: string; subtitle: string }> {
  const lines = [
    'For the educational topic "' + topic + '", write a title and one subtitle sentence.',
    'Return JSON only: { "title": "...", "subtitle": "..." }',
  ];
  return await callGeminiJSON<{ title: string; subtitle: string }>(lines.join('\n'));
}

export async function generateImmersiveText(source: SourceContent, persona: Persona): Promise<TextContent> {
  try {
    console.log('[TextAgent] Generating TOC...');
    const toc = await generateTOC(source, persona);
    await sleep(CALL_GAP_MS);

    const markedTOC = toc.map((s, i) => ({ ...s, done: false, current: i === 0 }));

    console.log('[TextAgent] Generating objectives...');
    const objectives = await generateObjectives(source, persona);
    await sleep(CALL_GAP_MS);

    const sections: any[] = [objectives];

    for (let i = 0; i < toc.length; i++) {
      console.log('[TextAgent] Section ' + String(i + 1) + '/' + String(toc.length) + ': ' + toc[i].title);
      const { prose, quiz } = await generateSection(source, persona, toc[i].title, i);
      sections.push(prose, quiz);
      if (i < toc.length - 1) await sleep(CALL_GAP_MS); // gap between sections, skip after last
    }

    await sleep(CALL_GAP_MS);
    console.log('[TextAgent] Generating title/subtitle...');
    const { title, subtitle } = await generateTitleSubtitle(source.topic);

    return { title, subtitle, toc: markedTOC, sections };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse Immersive Text JSON: ' + error.message);
    }
    throw new Error('Failed to generate immersive text: ' + error.message);
  }
}
