import { MasterContext, TextContent, AudioContent, AudioChapter } from '../types';

/**
 * Audio Agent — Hub and Spoke, Phase 2 Worker.
 *
 * ZERO Gemini calls. Builds a structured audio script from either:
 *   (a) TextContent (preferred — richer prose to read aloud), or
 *   (b) MasterContext (fallback — uses key facts and concept definitions)
 *
 * The Web Speech API on the frontend reads this script aloud.
 */

export function buildAudioFromTextContent(textContent: TextContent): AudioContent {
  const proseBlocks = textContent.sections.filter((s: any) => s.kind === 'prose');
  const objectives = textContent.sections.find((s: any) => s.kind === 'objectives');

  let script = 'Welcome to this audio lesson on ' + textContent.title + '.\n\n';

  if (objectives && Array.isArray(objectives.items) && objectives.items.length > 0) {
    script += '[CHAPTER: Introduction]\n';
    script += 'By the end of this lesson, you will be able to: ';
    script += objectives!.items!.join('; ') + '.\n\n';
  }

  proseBlocks.forEach((section: any, i: number) => {
    script += '[CHAPTER: ' + (section.heading || ('Part ' + (i + 1))) + ']\n';
    if (section.body) {
      script += section.body.replace(/\*\*(.+?)\*\*/g, '$1') + '\n\n';
    }
  });

  script += '[CHAPTER: Summary]\n';
  script += 'Great work making it through ' + textContent.title + '. ';
  script += 'Review the key concepts from each section as you continue learning.\n';

  return parseScriptToAudio('Audio Lesson: ' + textContent.title, script);
}

export function buildAudioFromMasterContext(masterCtx: MasterContext): AudioContent {
  let script = 'Welcome to this audio lesson on ' + masterCtx.topic + '.\n\n';
  script += '[CHAPTER: Overview]\n';
  script += masterCtx.oneLiner + '\n\n';

  script += '[CHAPTER: Key Concepts]\n';
  masterCtx.coreConcepts.forEach(c => {
    script += c.term + '. ' + c.definition + '\n';
  });
  script += '\n';

  script += '[CHAPTER: Key Facts]\n';
  masterCtx.keyFacts.forEach(f => {
    script += f + '\n';
  });
  script += '\n';

  masterCtx.toc.forEach((title, i) => {
    script += '[CHAPTER: ' + title + ']\n';
    // Placeholder — will be filled when textContent arrives
    script += 'This section covers ' + title + ' in depth.\n\n';
  });

  script += '[CHAPTER: Summary]\n';
  script += 'That covers the essential concepts of ' + masterCtx.topic + '. Keep reviewing and you\'ll master it!\n';

  return parseScriptToAudio('Audio Lesson: ' + masterCtx.topic, script);
}

function parseScriptToAudio(title: string, script: string): AudioContent {
  const parts = script.split(/\[CHAPTER:\s*(.+?)\]/g);
  const chapters: AudioChapter[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    chapters.push({ title: parts[i].trim(), timestamp: 0 });
  }

  if (chapters.length === 0) {
    chapters.push({ title: 'Introduction', timestamp: 0 });
  }

  return { title, script, chapters };
}
