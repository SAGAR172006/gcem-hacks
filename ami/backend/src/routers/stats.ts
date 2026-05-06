import { Router } from 'express';
import { supabase } from '../services/supabase';
import { requireAuth } from '../middleware/auth';
import { callGeminiTestJSON } from '../services/gemini';

export const statsRouter = Router();
statsRouter.use(requireAuth);

// Record a quiz answer
statsRouter.post('/quiz', async (req, res) => {
  try {
    const { moduleId, sectionId, correct, attempts } = req.body;
    const { error } = await supabase.from('learning_events').insert({
      user_id: req.user!.id,
      module_id: moduleId,
      event_type: 'quiz',
      section_id: sectionId,
      correct: correct ?? false,
      attempts: attempts ?? 1,
    });
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record a test score
statsRouter.post('/test', async (req, res) => {
  try {
    const { moduleId, score } = req.body;
    const { error } = await supabase.from('learning_events').insert({
      user_id: req.user!.id,
      module_id: moduleId,
      event_type: 'test',
      score,
    });
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Score a free-text explanation ─────────────────────────────────────────────
//
// Method: ANCHOR-PHRASE MATCHING
//
// We build an explicit ANCHORS list from the MasterContext:
//   - Each coreConcept → "CONCEPT N: term — definition"
//   - Each keyFact     → "FACT N: the fact"
//
// Gemini classifies each anchor as: hit / partial / miss
// Then computes a transparent score:
//   base    = (hits×2 + partials×1) / (totalAnchors×2) × 90
//   bonus   = 0–10  (insightful analogies, going beyond anchors)
//   penalty = 0–8   (substantial off-topic filler only — NOT verbosity)
//   final   = clamp(base + bonus − penalty, 0, 100)
//
// A student who hits every anchor but writes extra stuff → 90+
// A student who misses 1-2 anchors but explains the rest well → 75-89
// Score reflects UNDERSTANDING, never writing style or word choice.
//
statsRouter.post('/score-explanation', async (req, res) => {
  try {
    const { moduleId, explanation, sourceExcerpt, masterContext } = req.body;

    if (!explanation || explanation.length < 30) {
      return res.status(400).json({ error: 'Explanation too short.' });
    }

    // Build the ANCHORS list — one line per checkpoint
    const anchors: string[] = [];

    if (masterContext && Array.isArray(masterContext.coreConcepts) && masterContext.coreConcepts.length > 0) {
      masterContext.coreConcepts.forEach((c: any, i: number) => {
        anchors.push('CONCEPT ' + (i + 1) + ': ' + c.term + ' — ' + c.definition);
      });
    }
    if (masterContext && Array.isArray(masterContext.keyFacts) && masterContext.keyFacts.length > 0) {
      masterContext.keyFacts.forEach((f: string, i: number) => {
        anchors.push('FACT ' + (i + 1) + ': ' + f);
      });
    }
    // Fallback if MasterContext wasn't sent
    if (anchors.length === 0) {
      anchors.push('CONTENT: ' + (sourceExcerpt || '').slice(0, 1500));
    }

    const anchorBlock = anchors.join('\n');
    const totalAnchors = anchors.length;
    const maxBase = totalAnchors * 2; // denominator for score formula

    const prompt = [
      'You are an expert educational evaluator using ANCHOR-PHRASE MATCHING to score a student\'s free-text explanation.',
      'An ANCHOR is a specific concept or fact the student was expected to demonstrate understanding of.',
      '',
      '=== ANCHORS (checkpoints the student must hit) ===',
      anchorBlock,
      '=== END ANCHORS ===',
      '',
      '=== STUDENT\'S EXPLANATION ===',
      explanation.slice(0, 3000),
      '=== END ===',
      '',
      'STEP 1 — For EACH anchor, classify it:',
      '  "hit"     → student clearly showed understanding (paraphrasing, analogies, and own words fully count)',
      '  "partial" → student touched on it but incompletely or vaguely',
      '  "miss"    → student did not cover this anchor at all',
      '',
      'STEP 2 — Compute the score using this exact formula:',
      '  hits     = number of "hit" anchors',
      '  partials = number of "partial" anchors',
      '  base     = round((hits × 2 + partials × 1) / ' + maxBase + ' × 90)',
      '  bonus    = 0 to +10 (award ONLY for genuinely insightful analogies, connections, or content clearly beyond the anchors)',
      '  penalty  = 0 to -8 (deduct ONLY if student wrote SUBSTANTIAL filler that is completely unrelated to the topic; NOT for verbosity or extra examples)',
      '  final    = clamp(base + bonus − penalty, 0, 100)',
      '',
      'CRITICAL RULES:',
      '  - A student who hits ALL anchors but writes extra things → final ≥ 90',
      '  - A student who misses 1-2 anchors but explains the rest very well → final 75-89',
      '  - Do NOT penalise for: different words, simpler vocabulary, personal examples, long answers',
      '  - ONLY penalise if student wrote about a clearly different topic entirely',
      '',
      'Return ONLY this JSON (no markdown, no extra text):',
      '{',
      '  "score": <integer 0-100, computed using the formula above>,',
      '  "label": "<Excellent|Good|Almost There|Needs Work|Try Again>",',
      '  "hits": <integer>,',
      '  "partials": <integer>,',
      '  "misses": <integer>,',
      '  "conceptsCovered": ["anchor label or term the student correctly explained", "..."],',
      '  "conceptsMissed": ["anchor label or term they missed or got wrong", "..."],',
      '  "strengths": ["Quote or paraphrase a specific part of their explanation that was particularly good"],',
      '  "gaps": ["[Anchor label]: what the student should have explained here — be specific about what was missing"],',
      '  "irrelevantContent": "<one sentence describing off-topic content, or null if none>",',
      '  "suggestion": "One clear, actionable sentence: the single most impactful thing they should add or clarify to raise their score."',
      '}',
      '',
      'Label thresholds: Excellent=90-100, Good=70-89, Almost There=50-69, Needs Work=30-49, Try Again=0-29',
    ].join('\n');

    const result = await callGeminiTestJSON<{
      score: number;
      label: string;
      hits: number;
      partials: number;
      misses: number;
      conceptsCovered: string[];
      conceptsMissed: string[];
      strengths: string[];
      gaps: string[];
      irrelevantContent: string | null;
      suggestion: string;
    }>(prompt);

    // Clamp score defensively (in case Gemini drifts outside 0-100)
    result.score = Math.max(0, Math.min(100, Math.round(result.score)));

    // Save to learning events
    await supabase.from('learning_events').insert({
      user_id: req.user!.id,
      module_id: moduleId,
      event_type: 'test',
      score: result.score,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[Stats] score-explanation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get user's learning profile
statsRouter.get('/me', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('learning_events')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return res.json({ hasData: false, summary: null });
    }

    const quizEvents = data.filter(e => e.event_type === 'quiz');
    const testEvents = data.filter(e => e.event_type === 'test');

    const totalQuizzes = quizEvents.length;
    const correctQuizzes = quizEvents.filter(e => e.correct).length;
    const avgQuizScore = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : null;
    const avgAttempts = totalQuizzes > 0
      ? (quizEvents.reduce((sum, e) => sum + (e.attempts || 1), 0) / totalQuizzes).toFixed(1)
      : null;

    const testScores = testEvents.map(e => e.score).filter(s => s != null);
    const avgTestScore = testScores.length > 0
      ? Math.round(testScores.reduce((a, b) => a + b, 0) / testScores.length)
      : null;

    const parts: string[] = [];
    if (avgQuizScore !== null) parts.push('Quiz accuracy: ' + avgQuizScore + '%');
    if (avgAttempts !== null) parts.push('Avg attempts per quiz: ' + avgAttempts);
    if (avgTestScore !== null) parts.push('Avg test score: ' + avgTestScore + '/100');

    const pacing = avgAttempts && parseFloat(avgAttempts) > 1.8
      ? 'slower pacing with more examples'
      : 'standard pacing';

    const depth = avgQuizScore && avgQuizScore < 60
      ? 'simpler explanations and more analogies'
      : avgQuizScore && avgQuizScore > 85
        ? 'deeper depth and more nuance'
        : 'balanced depth';

    const adaptiveContext = parts.length > 0
      ? 'This user\'s learning history: ' + parts.join(', ') + '. Adjust content for ' + pacing + ' and ' + depth + '.'
      : null;

    res.json({
      hasData: true,
      avgQuizScore,
      avgTestScore,
      avgAttempts: avgAttempts ? parseFloat(avgAttempts) : null,
      totalSessions: data.length,
      adaptiveContext,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
