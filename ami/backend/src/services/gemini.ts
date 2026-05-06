import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

// ─── Key pool layout ───────────────────────────────────────────────────────────
// Key 0        → dedicated to AI Chatbot
// Key 1        → dedicated to Test Knowledge scoring
// Keys 2..mid  → "primary" pool  (Lead Agent + Text Agent)
// Keys mid+1.. → "secondary" pool (Slides Agent)
//
// WHY we split primary/secondary:
// Text agent and slides agent fire at the same time (Phase 2).
// If they share a pool they race for the same keys → burst 429s.
// Splitting the pool means they NEVER fight each other.
//
// With 25 keys:  0=chat, 1=test, 2-13=primary (12 keys), 14-24=secondary (11 keys)
// With 10 keys:  0=chat, 1=test, 2-5=primary (4 keys), 6-9=secondary (4 keys)
// With 4 keys:   0=chat, 1=test, 2=primary, 3=secondary
// With <4 keys:  all share the same pool (graceful fallback)

const total = config.geminiKeys.length;
const CHAT_KEY_IDX = 0;
const TEST_KEY_IDX = Math.min(1, total - 1);
const AGENT_START  = Math.min(2, total - 1);

// Split agent keys into two non-overlapping halves
const agentKeyCount = Math.max(0, total - AGENT_START);
const primaryCount   = Math.ceil(agentKeyCount / 2);
const PRIMARY_END    = AGENT_START + primaryCount;          // exclusive
// secondary starts right after primary
const SECONDARY_START = PRIMARY_END;                        // inclusive
// If there are no secondary keys, secondary falls back to primary pool
const hasSecondaryPool = SECONDARY_START < total;

// Per-key state
const keyCooldownUntil: number[] = new Array(total).fill(0); // 429 freeze-out
const keyLastUsedAt:    number[] = new Array(total).fill(0); // burst protection
const keyInUse:         boolean[] = new Array(total).fill(false);
const keyQuotaHits:     number[]  = new Array(total).fill(0); // diagnostic counter

const MIN_REUSE_MS    = 2_000;   // 2s between reuses of the same key
const QUOTA_FREEZE_MS = 65_000;  // freeze key for 65s on 429

// (cursors defined below, after acquireFromPool is declared)

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Print a summary of key health (call this from routes to diagnose)
export function logKeyStatus(): void {
  const now = Date.now();
  console.log('[Gemini] Pool layout: chat=0, test=1, primary=' + AGENT_START + '..' + (PRIMARY_END-1) + ', secondary=' + (hasSecondaryPool ? SECONDARY_START + '..' + (total-1) : 'none (fallback to primary)'));
  for (let i = AGENT_START; i < total; i++) {
    const pool = i < PRIMARY_END ? 'primary' : 'secondary';
    const cooling = keyCooldownUntil[i] > now;
    const recentlyUsed = (keyLastUsedAt[i] + MIN_REUSE_MS) > now;
    const status = cooling ? '❄️ frozen' : keyInUse[i] ? '🔄 in-use' : recentlyUsed ? '⏳ cooldown' : '✅ ready';
    console.log('  Key ' + i + ' [' + pool + ']: ' + status + (keyQuotaHits[i] > 0 ? ' [' + keyQuotaHits[i] + ' quota hits]' : ''));
  }
  const primaryReady = Array.from({length: PRIMARY_END - AGENT_START}, (_, i) => AGENT_START + i)
    .filter(i => keyCooldownUntil[i] <= now && !keyInUse[i] && (keyLastUsedAt[i] + MIN_REUSE_MS) <= now).length;
  const secReady = hasSecondaryPool
    ? Array.from({length: total - SECONDARY_START}, (_, i) => SECONDARY_START + i)
        .filter(i => keyCooldownUntil[i] <= now && !keyInUse[i] && (keyLastUsedAt[i] + MIN_REUSE_MS) <= now).length
    : 'n/a';
  console.log('[Gemini] Ready — primary: ' + primaryReady + '/' + (PRIMARY_END - AGENT_START) + ', secondary: ' + secReady + (hasSecondaryPool ? '/' + (total - SECONDARY_START) : ''));
}

// ─── Dedicated key acquire (chat / test) ─────────────────────────────────────

async function acquireDedicatedKey(idx: number): Promise<{ client: GoogleGenerativeAI; release: () => void }> {
  const freezeWait = keyCooldownUntil[idx] - Date.now();
  if (freezeWait > 0) {
    console.warn('[Gemini] Dedicated key ' + idx + ' frozen. Waiting ' + Math.ceil(freezeWait / 1000) + 's...');
    await sleep(freezeWait + 100);
  }
  while (keyInUse[idx]) await sleep(200);
  keyInUse[idx] = true;
  keyLastUsedAt[idx] = Date.now();
  return {
    client: new GoogleGenerativeAI(config.geminiKeys[idx]),
    release: () => { keyInUse[idx] = false; },
  };
}

// ─── Generic pool acquire (picks from a contiguous range of key indices) ──────

async function acquireFromPool(
  poolStart: number,
  poolEnd: number,   // exclusive
  poolName: string,
  rrRef: { cursor: number }
): Promise<{ client: GoogleGenerativeAI; index: number; release: () => void }> {
  const poolSize = poolEnd - poolStart;
  if (poolSize <= 0) {
    // Fallback: use dedicated key 0
    const { client, release } = await acquireDedicatedKey(0);
    return { client, index: 0, release };
  }

  const now = Date.now();

  // Try each key starting from cursor — find first available
  for (let offset = 0; offset < poolSize; offset++) {
    const i = poolStart + ((rrRef.cursor - poolStart + offset) % poolSize);
    const isFrozen    = keyCooldownUntil[i] > now;
    const isTooRecent = (keyLastUsedAt[i] + MIN_REUSE_MS) > now;
    if (!keyInUse[i] && !isFrozen && !isTooRecent) {
      keyInUse[i] = true;
      keyLastUsedAt[i] = now;
      rrRef.cursor = poolStart + ((i - poolStart + 1) % poolSize);
      console.log('[Gemini] Acquired ' + poolName + ' key ' + i);
      return {
        client: new GoogleGenerativeAI(config.geminiKeys[i]),
        index: i,
        release: () => { keyInUse[i] = false; },
      };
    }
  }

  // All keys busy/cooling — find soonest available (skip deeply frozen)
  let soonestIdx = poolStart;
  let soonestTime = Infinity;
  for (let i = poolStart; i < poolEnd; i++) {
    if (keyCooldownUntil[i] > Date.now() + 30_000) continue;
    const available = Math.max(keyCooldownUntil[i], keyLastUsedAt[i] + MIN_REUSE_MS);
    if (available < soonestTime) { soonestTime = available; soonestIdx = i; }
  }
  // If all deeply frozen, pick absolute soonest
  if (soonestTime === Infinity) {
    for (let i = poolStart; i < poolEnd; i++) {
      const available = Math.max(keyCooldownUntil[i], keyLastUsedAt[i] + MIN_REUSE_MS);
      if (available < soonestTime) { soonestTime = available; soonestIdx = i; }
    }
  }

  const waitMs = Math.max(0, soonestTime - Date.now());
  if (waitMs > 0) {
    console.warn('[Gemini] All ' + poolName + ' keys busy. Waiting ' + Math.ceil(waitMs / 1000) + 's for key ' + soonestIdx);
    logKeyStatus();
    await sleep(waitMs + 100);
  }
  while (keyInUse[soonestIdx]) await sleep(200);
  keyInUse[soonestIdx] = true;
  keyLastUsedAt[soonestIdx] = Date.now();
  rrRef.cursor = poolStart + ((soonestIdx - poolStart + 1) % poolSize);
  console.log('[Gemini] Acquired ' + poolName + ' key ' + soonestIdx + ' (after wait)');
  return {
    client: new GoogleGenerativeAI(config.geminiKeys[soonestIdx]),
    index: soonestIdx,
    release: () => { keyInUse[soonestIdx] = false; },
  };
}

// Cursors wrapped in objects so acquireFromPool can mutate them by reference
const rrPrimaryRef   = { cursor: AGENT_START };
const rrSecondaryRef = { cursor: hasSecondaryPool ? SECONDARY_START : AGENT_START };

// Primary pool: Lead Agent + Text Agent
async function acquireAgentKey(): Promise<{ client: GoogleGenerativeAI; index: number; release: () => void }> {
  return acquireFromPool(AGENT_START, PRIMARY_END, 'primary', rrPrimaryRef);
}

// Secondary pool: Slides Agent (non-overlapping with primary → no racing)
async function acquireSecondaryKey(): Promise<{ client: GoogleGenerativeAI; index: number; release: () => void }> {
  if (!hasSecondaryPool) {
    // Not enough keys — fall back to primary pool gracefully
    return acquireFromPool(AGENT_START, PRIMARY_END, 'primary(fallback)', rrPrimaryRef);
  }
  return acquireFromPool(SECONDARY_START, total, 'secondary', rrSecondaryRef);
}

// ─── Core call helper ─────────────────────────────────────────────────────────

async function callWithKey(
  client: GoogleGenerativeAI,
  index: number,
  release: () => void,
  prompt: string,
  modelName: string,
  retryFn: () => Promise<string>,
): Promise<string> {
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    release();
    return result.response.text();
  } catch (err: any) {
    release();
    const isQuota = err?.status === 429
      || String(err).includes('429')
      || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      keyCooldownUntil[index] = Date.now() + QUOTA_FREEZE_MS;
      keyQuotaHits[index]++;
      console.warn('[Gemini] Key ' + index + ' quota hit #' + keyQuotaHits[index] + '. Frozen 65s. Trying next key...');
      logKeyStatus();
      return retryFn();
    }
    throw err;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Primary pool (Lead Agent + Text Agent)
export async function callGemini(prompt: string, modelName = 'gemini-2.0-flash'): Promise<string> {
  const { client, index, release } = await acquireAgentKey();
  return callWithKey(client, index, release, prompt, modelName, () => callGemini(prompt, modelName));
}

// Secondary pool (Slides Agent) — isolated so it never races with text generation
export async function callGeminiSlides(prompt: string, modelName = 'gemini-2.0-flash'): Promise<string> {
  const { client, index, release } = await acquireSecondaryKey();
  return callWithKey(client, index, release, prompt, modelName, () => callGeminiSlides(prompt, modelName));
}

export async function callGeminiForTest(prompt: string, modelName = 'gemini-2.0-flash'): Promise<string> {
  const { client, release } = await acquireDedicatedKey(TEST_KEY_IDX);
  return callWithKey(client, TEST_KEY_IDX, release, prompt, modelName, () => callGeminiForTest(prompt, modelName));
}

export async function callGeminiForChat(prompt: string, modelName = 'gemini-2.0-flash'): Promise<string> {
  const { client, release } = await acquireDedicatedKey(CHAT_KEY_IDX);
  return callWithKey(client, CHAT_KEY_IDX, release, prompt, modelName, () => callGeminiForChat(prompt, modelName));
}

export function getChatKeyIndex(): number { return CHAT_KEY_IDX; }
export function getTestKeyIndex(): number { return TEST_KEY_IDX; }

export async function callGeminiJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGemini(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function callGeminiSlidesJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGeminiSlides(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function callGeminiTestJSON<T = any>(prompt: string): Promise<T> {
  const fullPrompt = prompt + '\n\nRespond with valid JSON only. No markdown, no code blocks, no explanation.';
  const text = await callGeminiForTest(fullPrompt);
  const cleaned = text.trim()
    .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function callGeminiVision(prompt: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
  const { client, index, release } = await acquireAgentKey();
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
      keyCooldownUntil[index] = Date.now() + QUOTA_FREEZE_MS;
      keyQuotaHits[index]++;
      console.warn('[Gemini Vision] Key ' + index + ' quota hit. Retrying...');
      return callGeminiVision(prompt, imageBuffer, mimeType);
    }
    throw err;
  }
}
