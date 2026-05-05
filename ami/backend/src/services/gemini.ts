import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

// Per-key state
const keyInUse: boolean[] = new Array(config.geminiKeys.length).fill(false);
const keyCooldownUntil: number[] = new Array(config.geminiKeys.length).fill(0);

// Round-robin cursor so we spread load evenly across keys (not always starting from key 0)
let rrCursor = 0;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function acquireKey(): Promise<{ client: GoogleGenerativeAI; index: number; release: () => void }> {
  const total = config.geminiKeys.length;
  const now = Date.now();

  // Try each key starting from round-robin cursor, skipping locked or cooling-down keys
  for (let offset = 0; offset < total; offset++) {
    const i = (rrCursor + offset) % total;
    if (!keyInUse[i] && keyCooldownUntil[i] <= now) {
      keyInUse[i] = true;
      rrCursor = (i + 1) % total; // advance cursor past this key for next caller
      return {
        client: new GoogleGenerativeAI(config.geminiKeys[i]),
        index: i,
        release: () => { keyInUse[i] = false; },
      };
    }
  }

  // All keys are either in use or cooling down — find the one that cools down soonest
  let soonestIndex = 0;
  let soonestTime = Infinity;
  for (let i = 0; i < total; i++) {
    if (keyCooldownUntil[i] < soonestTime) {
      soonestTime = keyCooldownUntil[i];
      soonestIndex = i;
    }
  }
  const waitMs = Math.max(0, soonestTime - Date.now());
  if (waitMs > 0) {
    console.warn('[Gemini] All keys cooling down. Waiting ' + Math.ceil(waitMs / 1000) + 's for key ' + soonestIndex + '...');
    await sleep(waitMs + 200); // +200ms buffer
  }
  keyInUse[soonestIndex] = true;
  rrCursor = (soonestIndex + 1) % total;
  return {
    client: new GoogleGenerativeAI(config.geminiKeys[soonestIndex]),
    index: soonestIndex,
    release: () => { keyInUse[soonestIndex] = false; },
  };
}

export async function callGemini(prompt: string, modelName = 'gemini-2.0-flash'): Promise<string> {
  const total = config.geminiKeys.length;

  // Retry up to total*2 times (allows waiting through cooldowns)
  for (let attempt = 0; attempt < total * 2; attempt++) {
    const { client, index, release } = await acquireKey();
    console.log('[Gemini] Using key ' + index + ' (attempt ' + (attempt + 1) + ')');
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      release();
      return result.response.text();
    } catch (err: any) {
      release();
      const isQuota = err?.status === 429 || String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        // Cool this key down for 65 seconds
        keyCooldownUntil[index] = Date.now() + 65000;
        console.warn('[Gemini] Key ' + index + ' quota hit. Cooling for 65s. Attempt ' + (attempt + 1) + '/' + String(total * 2));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All Gemini keys exhausted or quota exceeded.');
}

export async function callGeminiJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGemini(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function callGeminiVision(prompt: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
  const total = config.geminiKeys.length;

  for (let attempt = 0; attempt < total * 2; attempt++) {
    const { client, index, release } = await acquireKey();
    console.log('[Gemini Vision] Using key ' + index + ' (attempt ' + (attempt + 1) + ')');
    try {
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBuffer.toString('base64'), mimeType } }
      ]);
      release();
      return result.response.text();
    } catch (err: any) {
      release();
      const isQuota = err?.status === 429 || String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        keyCooldownUntil[index] = Date.now() + 65000;
        console.warn('[Gemini Vision] Key ' + index + ' quota hit. Cooling for 65s.');
        continue;
      }
      throw err;
    }
  }
  throw new Error('All Gemini keys exhausted or quota exceeded.');
}
