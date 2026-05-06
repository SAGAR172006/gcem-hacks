import { MasterContext, Persona, Slide } from '../types';
import { callGeminiSlidesJSON } from '../services/gemini';
import { imageAgent } from './imageAgent';
import { serializeMasterContext } from './leadAgent';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Slides Agent — Hub and Spoke, Phase 2 Worker.
 *
 * Receives lightweight MasterContext. One Gemini call → 6 slides with narration.
 * Unsplash images fetched sequentially using imageKeywords from MasterContext.
 */
export async function generateSlides(
  masterCtx: MasterContext,
  persona: Persona
): Promise<Slide[]> {
  const contextBlock = serializeMasterContext(masterCtx);

  const prompt = [
    'You are a presentation agent for AMI, an educational app.',
    'Student level: ' + persona.grade,
    '',
    '=== MASTER CONTEXT ===',
    contextBlock,
    '=== END MASTER CONTEXT ===',
    '',
    'Create exactly 6 slides for a presentation on: ' + masterCtx.topic,
    'Base ALL content strictly on the Master Context above.',
    '',
    'Output STRICTLY as a raw JSON array — no markdown, no code blocks:',
    '[',
    '  {',
    '    "slideNumber": 1,',
    '    "kind": "cover",',
    '    "title": "Topic title",',
    '    "subtitle": "One sentence subtitle",',
    '    "narration": "Welcome narration (1-2 sentences, podcast tone)",',
    '    "imageSearchKeyword": "specific noun for Unsplash"',
    '  },',
    '  {',
    '    "slideNumber": 2,',
    '    "kind": "bullet",',
    '    "title": "Slide title",',
    '    "points": ["Point 1", "Point 2", "Point 3", "Point 4"],',
    '    "narration": "Narration (1-2 sentences)",',
    '    "imageSearchKeyword": "specific noun"',
    '  },',
    '  // ... slides 3-6 using kinds: stat, split, bullet, bullet',
    ']',
    '',
    'Slide kinds available:',
    '  "cover"  — needs subtitle (slide 1 MUST be cover)',
    '  "bullet" — needs points: array of exactly 4 short strings',
    '  "stat"   — needs stat: a striking number/%, and caption: string',
    '  "split"  — needs cards: [{label, title, body}, {label, title, body}]',
    '',
    'Rules:',
    '- Slide 1 MUST be kind "cover"',
    '- No two consecutive slides the same kind',
    '- Every slide needs narration (friendly podcast voice, 1-2 sentences)',
    '- imageSearchKeyword: one specific concrete noun (e.g. "microscope" not "biology")',
    '- Return raw JSON array only. No text outside the array.',
  ].join('\n');

  try {
    console.log('[SlidesAgent] Generating slides from Master Context (secondary key pool)...');
    const rawSlides = await callGeminiSlidesJSON<any[]>(prompt);

    await sleep(500);

    // Fetch Unsplash images using MasterContext imageKeywords as fallbacks
    const slides: Slide[] = [];
    for (let i = 0; i < rawSlides.length; i++) {
      const slide = rawSlides[i];
      // Use the slide's own keyword, fallback to MasterContext imageKeywords pool
      const keyword = slide.imageSearchKeyword
        || masterCtx.imageKeywords[i % masterCtx.imageKeywords.length]
        || masterCtx.topic;

      const imageUrl = slide.kind === 'cover' ? null : await imageAgent(keyword);
      if (slide.kind !== 'cover') await sleep(250);

      slides.push({
        id: 'slide_' + slide.slideNumber,
        kind: slide.kind || 'bullet',
        title: slide.title || '',
        subtitle: slide.subtitle,
        points: slide.points,
        stat: slide.stat,
        caption: slide.caption,
        cards: slide.cards,
        narration: slide.narration || '',
        imageUrl,
      } as Slide);
    }

    console.log('[SlidesAgent] Done — ' + slides.length + ' slides generated');
    return slides;
  } catch (err: any) {
    if (err instanceof SyntaxError) throw new Error('[SlidesAgent] Failed to parse JSON: ' + err.message);
    throw new Error('[SlidesAgent] Failed to generate slides: ' + err.message);
  }
}
