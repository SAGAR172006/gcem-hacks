import { Router } from 'express';
import { supabase } from '../services/supabase';
import { requireAuth } from '../middleware/auth';
import { callGeminiJSON } from '../services/gemini';

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

// Record a test knowledge submission
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

// Score a free-text explanation with Gemini rubric
statsRouter.post('/score-explanation', async (req, res) => {
  try {
    const { moduleId, explanation, sourceExcerpt } = req.body;
    if (!explanation || explanation.length < 30) {
      return res.status(400).json({ error: 'Explanation too short.' });
    }

    const lines = [
      'You are an expert educational evaluator.',
      '',
      'The student was asked to explain the following topic in their own words.',
      '',
      'Source material (what they should have learned):',
      (sourceExcerpt || '').slice(0, 2000),
      '',
      'Student\'s explanation:',
      explanation,
      '',
      'Evaluate the explanation strictly and fairly. Return JSON only:',
      '{',
      '  "score": <integer 0-100>,',
      '  "label": "<one of: Excellent | Good | Almost There | Needs Work | Try Again>",',
      '  "strengths": ["specific thing they explained well", "another strength"],',
      '  "gaps": ["specific concept they missed or got wrong", "another gap"],',
      '  "suggestion": "One sentence of the most important thing to focus on next."',
      '}',
      '',
      'Scoring rubric:',
      '90-100: Covers all key concepts accurately with good detail',
      '70-89: Covers most concepts, minor gaps or imprecision',
      '50-69: Covers some concepts but missing important ideas',
      '30-49: Partial understanding, significant gaps',
      '0-29: Mostly incorrect or off-topic',
    ];

    const result = await callGeminiJSON<{
      score: number;
      label: string;
      strengths: string[];
      gaps: string[];
      suggestion: string;
    }>(lines.join('\n'));

    // Save the score event
    await supabase.from('learning_events').insert({
      user_id: req.user!.id,
      module_id: moduleId,
      event_type: 'test',
      score: result.score,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's learning profile summary (used to adapt generation)
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

    // Build a short adaptive prompt string for injection into agent prompts
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
