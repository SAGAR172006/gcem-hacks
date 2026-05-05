import { TextContent, Persona, AudioContent, AudioChapter } from '../types';
import { callGemini } from '../services/gemini';

export async function generateAudioScript(textContent: TextContent, persona: Persona): Promise<AudioContent> {
  const prompt = `Write a conversational audio lesson script for: ${textContent.title}

Student level: ${persona.grade}
Student interest: ${persona.interest}

The script must:
- Open with a hook question that connects to ${persona.interest}
- Sound like a friendly, enthusiastic teacher talking directly to the student (use "you")
- Be 500-700 words total
- Include at least one analogy involving ${persona.interest}
- Cover these topics in order:
${textContent.toc.map((t, i) => `  ${i + 1}. ${t.title}`).join('\n')}

Mark chapter breaks exactly like this (the text inside is the chapter title):
[CHAPTER: Introduction]
... content ...
[CHAPTER: Next Chapter Name]
... content ...

End with a motivational closing line.
Do not include any stage directions, sound effects, or formatting — plain narration text only.`;

  try {
    const fullScriptText = await callGemini(prompt);

    // Parse the script into chapters
    // By using a regex with a capture group, split() returns the text interleaved with the captured titles.
    const parts = fullScriptText.split(/\[CHAPTER:\s*(.+?)\]/g);
    const chapters: AudioChapter[] = [];

    // parts[0] is the text before the first chapter (often empty if it starts right away)
    // parts[1] is the first chapter title, parts[2] is its content, etc.
    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].trim();
      // const content = parts[i + 1] ? parts[i + 1].trim() : ''; 
      
      chapters.push({
        title,
        timestamp: 0 // Frontend Web Speech API will read aloud; real timestamps can be calculated later
      });
    }

    // Fallback if the AI failed to generate any [CHAPTER:] markers
    if (chapters.length === 0) {
      chapters.push({
        title: 'Introduction',
        timestamp: 0
      });
    }

    return {
      title: `Audio Lesson: ${textContent.title}`,
      script: fullScriptText,
      chapters
    };
  } catch (error: any) {
    throw new Error(`Failed to generate audio script: ${error.message}`);
  }
}
