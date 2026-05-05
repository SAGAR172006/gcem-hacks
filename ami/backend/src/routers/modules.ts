import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fileUpload from 'express-fileupload';
import pdfParse from 'pdf-parse';
import { requireAuth } from '../middleware/auth';
import { runPhase1, runPhase2 } from '../agents/orchestrator';
import { supabase } from '../services/supabase';
import { callGeminiVision } from '../services/gemini';
import { Module, Persona, SourceContent } from '../types';

export const modulesRouter = Router();
modulesRouter.use(requireAuth);

async function enrichPersona(userId: string, persona: Persona): Promise<Persona> {
  try {
    const { data } = await supabase
      .from('learning_events')
      .select('event_type, correct, attempts, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(60);
    if (!data || data.length === 0) return persona;
    const quizEvents = data.filter((e: any) => e.event_type === 'quiz');
    const testEvents = data.filter((e: any) => e.event_type === 'test');
    const totalQ = quizEvents.length;
    const correctQ = quizEvents.filter((e: any) => e.correct).length;
    const avgQuiz = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : null;
    const avgAttempts = totalQ > 0
      ? quizEvents.reduce((s: number, e: any) => s + (e.attempts || 1), 0) / totalQ
      : null;
    const testScores = testEvents.map((e: any) => e.score).filter((s: any) => s != null);
    const avgTest = testScores.length > 0
      ? Math.round(testScores.reduce((a: number, b: number) => a + b, 0) / testScores.length)
      : null;
    const parts: string[] = [];
    if (avgQuiz !== null) parts.push('quiz accuracy ' + avgQuiz + '%');
    if (avgTest !== null) parts.push('test score avg ' + avgTest + '/100');
    if (avgAttempts !== null && avgAttempts > 1.8) parts.push('needs slower pacing and more examples');
    else if (avgQuiz !== null && avgQuiz > 85) parts.push('ready for deeper depth and nuance');
    if (parts.length === 0) return persona;
    return { ...persona, adaptiveContext: 'Learner history: ' + parts.join(', ') + '. Tailor accordingly.' };
  } catch {
    return persona;
  }
}

async function runBackgroundPhase2(moduleId: string, source: SourceContent, textContent: any, persona: Persona) {
  try {
    const { slides, mindmap, audio } = await runPhase2(source, textContent, persona);
    await supabase.from('modules').update({ slides, mindmap, audio, status: 'complete' }).eq('id', moduleId);
    console.log('[Modules] Phase 2 complete for ' + moduleId);
  } catch (err: any) {
    console.error('[Modules] Phase 2 failed for ' + moduleId + ':', err.message);
    await supabase.from('modules').update({ status: 'error' }).eq('id', moduleId);
  }
}

modulesRouter.post('/generate', async (req, res) => {
  try {
    const { topic, persona } = req.body;
    if (!topic || !persona) return res.status(400).json({ error: 'Topic and persona are required' });
    const enrichedPersona = await enrichPersona(req.user!.id, persona);
    const { source, textContent } = await runPhase1(topic, enrichedPersona);
    const moduleId = uuidv4();
    const moduleObj: Module = {
      id: moduleId, userId: req.user!.id, topic, persona: enrichedPersona,
      source, textContent, slides: [], mindmap: [],
      audio: { title: '', script: '', chapters: [] },
      progress: 0, fromUpload: false, deadline: null, createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from('modules').insert({
      id: moduleObj.id, user_id: moduleObj.userId, topic: moduleObj.topic,
      persona: moduleObj.persona, source: moduleObj.source,
      text_content: moduleObj.textContent, slides: moduleObj.slides,
      mindmap: moduleObj.mindmap, audio: moduleObj.audio,
      progress: moduleObj.progress, from_upload: moduleObj.fromUpload,
      deadline: moduleObj.deadline, status: 'generating'
    });
    if (error) throw new Error(error.message);
    res.json({ ...moduleObj, status: 'generating' });
    runBackgroundPhase2(moduleId, source, textContent, enrichedPersona);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.files) return res.status(400).json({ error: 'No files uploaded' });
    let rawFiles = req.files.files;
    const files: fileUpload.UploadedFile[] = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
    const persona: Persona = JSON.parse(req.body.persona || '{}');
    const deadline = req.body.deadline || null;
    let combinedText = '';
    for (const file of files) {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.data);
        combinedText += data.text + '\n\n';
      } else if (file.mimetype.startsWith('image/')) {
        const text = await callGeminiVision('Extract all readable text from this image. Return plain text only.', file.data, file.mimetype);
        combinedText += text + '\n\n';
      }
    }
    if (!combinedText.trim()) return res.status(400).json({ error: 'No extractable text found in files.' });
    combinedText = combinedText.substring(0, 8000);
    const topic = files[0].name.replace(/\.[^.]+$/, '');
    const source: SourceContent = { topic, sourceTitle: 'Uploaded material', sourceExcerpt: combinedText, sourceUrl: null };
    const enrichedPersona = await enrichPersona(req.user!.id, persona);
    const { textContent } = await runPhase1(topic, enrichedPersona, true, source);
    const moduleId = uuidv4();
    const moduleObj: Module = {
      id: moduleId, userId: req.user!.id, topic, persona: enrichedPersona,
      source, textContent, slides: [], mindmap: [],
      audio: { title: '', script: '', chapters: [] },
      progress: 0, fromUpload: true, deadline, createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from('modules').insert({
      id: moduleObj.id, user_id: moduleObj.userId, topic: moduleObj.topic,
      persona: moduleObj.persona, source: moduleObj.source,
      text_content: moduleObj.textContent, slides: moduleObj.slides,
      mindmap: moduleObj.mindmap, audio: moduleObj.audio,
      progress: moduleObj.progress, from_upload: moduleObj.fromUpload,
      deadline: moduleObj.deadline, status: 'generating'
    });
    if (error) throw new Error(error.message);
    res.json({ ...moduleObj, status: 'generating' });
    runBackgroundPhase2(moduleId, source, textContent, enrichedPersona);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('id, topic, progress, from_upload, created_at, status')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data.map((mod: any) => ({ ...mod, fromUpload: mod.from_upload, createdAt: mod.created_at })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('modules').select('*')
      .eq('id', req.params.id).eq('user_id', req.user!.id).single();
    if (error || !data) return res.status(404).json({ error: 'Module not found' });
    res.json({ ...data, userId: data.user_id, textContent: data.text_content, fromUpload: data.from_upload, createdAt: data.created_at });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.get('/:id/status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('modules').select('id, status, slides, mindmap, audio')
      .eq('id', req.params.id).eq('user_id', req.user!.id).single();
    if (error || !data) return res.status(404).json({ error: 'Module not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.put('/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    if (typeof progress !== 'number' || progress < 0 || progress > 1) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 1' });
    }
    const { error } = await supabase.from('modules')
      .update({ progress }).eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

modulesRouter.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('modules')
      .delete().eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
