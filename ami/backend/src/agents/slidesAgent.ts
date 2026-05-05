import { SourceContent, TextContent, Persona, Slide } from '../types';
import { callGeminiJSON } from '../services/gemini';
import { imageAgent } from './imageAgent';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function generateSlides(
  source: SourceContent,
  textContent: TextContent,
  persona: Persona
): Promise<Slide[]> {
  const prompt = [
    'You are a presentation agent for an educational app called AMI.',
    'Summarize the following topic into exactly 6 slides.',
    'Topic: ' + source.topic,
    'Student level: ' + persona.grade,
    '',
    'Content to base slides on:',
    textContent.toc.map((t: any, i: number) => (i + 1) + '. ' + t.title).join('\n'),
    '',
    'Output STRICTLY as a raw JSON array — no markdown, no code blocks, no explanation.',
    'Each slide object must have:',
    '  "slideNumber": integer 1 through 6',
    '  "kind": one of "cover" | "bullet" | "stat" | "split"',
    '  "title": string',
    '  "narration": string (1-2 sentence spoken narration)',
    '  "imageSearchKeyword": one specific concrete word for Unsplash image search',
    '',
    'Additional fields by kind:',
    '  cover: add "subtitle": string',
    '  bullet: add "points": array of exactly 4 short strings',
    '  stat: add "stat": striking number or percentage string, "caption": string',
    '  split: add "cards": [{label: string, title: string, body: string}, {label: string, title: string, body: string}]',
    '',
    'Rules: slide 1 MUST be kind "cover". No two consecutive slides the same kind. Return raw JSON array only.',
  ].join('\n');

  try {
    const rawSlides = await callGeminiJSON<any[]>(prompt);

    // Small delay before image fetches to avoid burst
    await sleep(800);

    // Fetch Unsplash images sequentially with small gaps (avoids hammering rate limits)
    const slides: Slide[] = [];
    for (const slide of rawSlides) {
      const keyword = slide.imageSearchKeyword || source.topic;
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

    return slides;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse Slides JSON: ' + error.message);
    }
    throw new Error('Failed to generate slides: ' + error.message);
  }
}
