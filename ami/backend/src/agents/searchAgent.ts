import { httpClient } from '../services/axios';
import { supabase } from '../services/supabase';
import { Persona, SourceContent } from '../types';
import { config } from '../config';

const CACHE_TTL_DAYS = 7;

async function getCachedSource(topic: string): Promise<SourceContent | null> {
  try {
    const key = topic.trim().toLowerCase();
    const { data, error } = await supabase
      .from('source_cache')
      .select('*')
      .eq('topic_key', key)
      .single();

    if (error || !data) return null;

    const cachedAt = new Date(data.cached_at).getTime();
    const ageMs = Date.now() - cachedAt;
    const ttlMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

    if (ageMs > ttlMs) {
      // Expired — delete and return null so fresh fetch happens
      await supabase.from('source_cache').delete().eq('topic_key', key);
      return null;
    }

    console.log('[SearchAgent] Cache HIT for "' + topic + '" (cached ' + Math.floor(ageMs / 3600000) + 'h ago)');
    return data.content as SourceContent;
  } catch {
    return null;
  }
}

async function setCachedSource(topic: string, content: SourceContent): Promise<void> {
  try {
    const key = topic.trim().toLowerCase();
    await supabase.from('source_cache').upsert(
      { topic_key: key, content, cached_at: new Date().toISOString() },
      { onConflict: 'topic_key' }
    );
    console.log('[SearchAgent] Cached source for "' + topic + '"');
  } catch (err) {
    console.warn('[SearchAgent] Failed to cache source:', err);
  }
}

async function fetchFreshSource(topic: string): Promise<SourceContent> {
  const encodedTopic = encodeURIComponent(topic);
  let title = topic;
  let rawText = '';
  let sourceUrl = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(topic);

  // Try SerpAPI if configured
  if (config.serpapiKey) {
    try {
      const serpRes = await httpClient.get(
        'https://serpapi.com/search.json?q=' + encodedTopic + '&api_key=' + config.serpapiKey
      );
      if (serpRes.data) {
        if (serpRes.data.knowledge_graph?.description) {
          rawText = serpRes.data.knowledge_graph.description;
          if (serpRes.data.knowledge_graph.source?.link) {
            sourceUrl = serpRes.data.knowledge_graph.source.link;
          }
        } else if (serpRes.data.organic_results?.length > 0) {
          rawText = serpRes.data.organic_results.slice(0, 3).map((r: any) => r.snippet).join('\n\n');
          sourceUrl = serpRes.data.organic_results[0].link;
          title = serpRes.data.organic_results[0].title;
        }
      }
    } catch (err) {
      console.warn('[SearchAgent] SerpAPI fetch failed for ' + topic);
    }
  }

  // Fallback to Wikipedia
  if (!rawText || rawText.length < 100) {
    try {
      const summaryRes = await httpClient.get(
        'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodedTopic
      );
      if (summaryRes.data?.title) title = summaryRes.data.title;
      if (summaryRes.data?.extract) rawText = summaryRes.data.extract;
    } catch {
      console.warn('[SearchAgent] Wikipedia summary failed for ' + topic);
    }

    try {
      const fullRes = await httpClient.get(
        'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodedTopic + '&prop=extracts&explaintext=1&format=json'
      );
      if (fullRes.data?.query?.pages) {
        const pages = fullRes.data.query.pages;
        const pageIds = Object.keys(pages);
        if (pageIds.length > 0 && pageIds[0] !== '-1') {
          const page = pages[pageIds[0]];
          if (page.title) title = page.title;
          if (page.extract?.trim().length > 0) rawText = page.extract;
        }
      }
    } catch {
      console.warn('[SearchAgent] Wikipedia full text failed for ' + topic);
    }
  }

  if (!rawText) throw new Error('No text content found');

  let cleanedText = rawText
    .replace(/\[\d+\]/g, '')
    .replace(/\[edit\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const MAX_CHARS = 8000;
  if (cleanedText.length > MAX_CHARS) {
    const truncated = cleanedText.substring(0, MAX_CHARS);
    const lastPeriod = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('.\n'),
      truncated.lastIndexOf('? '),
      truncated.lastIndexOf('! ')
    );
    cleanedText = lastPeriod !== -1 ? truncated.substring(0, lastPeriod + 1) : truncated;
  }

  return {
    topic,
    sourceTitle: title + ' — Search Result',
    sourceExcerpt: cleanedText,
    sourceUrl
  };
}

export async function searchAndScrape(topic: string, persona: Persona): Promise<SourceContent> {
  try {
    // Check cache first — saves Gemini quota by reusing existing source text
    const cached = await getCachedSource(topic);
    if (cached) return cached;

    console.log('[SearchAgent] Cache MISS for "' + topic + '" — fetching fresh...');
    const fresh = await fetchFreshSource(topic);

    // Store in cache (fire and forget — don't block generation)
    setCachedSource(topic, fresh);

    return fresh;
  } catch (error) {
    throw new Error('Could not find source material for "' + topic + '". Try a more specific topic.');
  }
}
