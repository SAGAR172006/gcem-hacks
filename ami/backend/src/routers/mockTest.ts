import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { generateMockTest, evaluateMockTestAnswers } from '../agents/mockTestAgent';
import { runPhase1, runPhase2 } from '../agents/orchestrator';

export const mockTestRouter = Router();
mockTestRouter.use(requireAuth);

/**
 * Checks if the requested marks distribution grid matches the question mark distribution of a stored mock test.
 */
function distributionsMatch(requestedDist: any[], dbQuestions: any[]): boolean {
  if (!Array.isArray(requestedDist) || !Array.isArray(dbQuestions)) return false;
  
  // Group requested distribution: map of marks -> count
  const reqMap: Record<number, number> = {};
  for (const item of requestedDist) {
    if (item && typeof item.marks === 'number') {
      reqMap[item.marks] = (reqMap[item.marks] || 0) + (item.count || 1);
    }
  }
  
  // Group DB questions distribution: map of marks -> count
  const dbMap: Record<number, number> = {};
  for (const q of dbQuestions) {
    if (q && typeof q.marks === 'number') {
      dbMap[q.marks] = (dbMap[q.marks] || 0) + 1;
    }
  }
  
  const reqKeys = Object.keys(reqMap).sort();
  const dbKeys = Object.keys(dbMap).sort();
  if (reqKeys.length !== dbKeys.length) return false;
  
  for (let i = 0; i < reqKeys.length; i++) {
    const k = parseInt(reqKeys[i], 10);
    if (parseInt(dbKeys[i], 10) !== k) return false;
    if (reqMap[k] !== dbMap[k]) return false;
  }
  
  return true;
}

mockTestRouter.post('/generate', async (req, res) => {
  try {
    const { syllabusText, maxMarks, distribution, instructions, moduleId, topic, persona } = req.body;

    // 1. Parse and validate maxMarks and distribution (supporting FormData strings)
    let parsedMaxMarks = typeof maxMarks === 'string' ? parseInt(maxMarks, 10) : maxMarks;
    let parsedDistribution = distribution;
    if (typeof distribution === 'string') {
      try {
        parsedDistribution = JSON.parse(distribution);
      } catch (err) {
        parsedDistribution = null;
      }
    }
    let parsedPersona = persona;
    if (typeof persona === 'string') {
      try {
        parsedPersona = JSON.parse(persona);
      } catch (err) {}
    }

    if (!parsedMaxMarks || !parsedDistribution || !Array.isArray(parsedDistribution)) {
      return res.status(400).json({ error: 'maxMarks and questions distribution grid are required.' });
    }

    let sourceText = syllabusText || '';

    // Check for uploaded files (e.g. syllabus PDF)
    if (req.files && req.files.files) {
      const rawFiles = req.files.files;
      const files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ error: `File "${file.name}" exceeds the 10 MB size limit.` });
        }
        if (file.mimetype === 'application/pdf') {
          const data = await pdfParse(file.data);
          sourceText += data.text + '\n\n';
        }
      }
    }
    
    // 2. If no syllabus text, but we have a topic, let's query SerpAPI and run Phase 1!
    if (!sourceText.trim() && topic) {
      console.log(`[MockTestRouter] Syllabus empty, running SerpAPI fallback for topic: ${topic}`);
      const defaultPersona = parsedPersona || { grade: 'College', interest: 'everyday life' };
      const { source } = await runPhase1(topic, defaultPersona);
      sourceText = source.sourceExcerpt;
    }

    if (!sourceText.trim()) {
      return res.status(400).json({ error: 'Please upload a syllabus PDF or specify a topic.' });
    }

    // 3. Database lookup for exact duplicate match (same topic/PDF content AND same marks configuration)
    const { data: userModules } = await supabase
      .from('modules')
      .select('*')
      .eq('user_id', req.user!.id);

    let matchingModule = null;
    let sourceModuleForContent = null;

    if (userModules && userModules.length > 0) {
      for (const mod of userModules) {
        let contentMatches = false;
        if (sourceText.trim()) {
          contentMatches = mod.source && mod.source.sourceExcerpt && mod.source.sourceExcerpt.trim() === sourceText.trim();
        } else if (topic) {
          contentMatches = mod.topic && mod.topic.toLowerCase().trim() === topic.toLowerCase().trim();
        }

        if (contentMatches) {
          // Track this module as a source of fully-generated study materials (Immersive Text, Audio, Mindmap)
          if (mod.text_content && !sourceModuleForContent) {
            sourceModuleForContent = mod;
          }

          // Check if marks configuration matches exactly
          if (mod.mock_test) {
            const maxMarksMatch = mod.mock_test.maxMarks === parsedMaxMarks;
            const distMatch = distributionsMatch(parsedDistribution, mod.mock_test.questions);
            if (maxMarksMatch && distMatch) {
              matchingModule = mod;
              break;
            }
          }
        }
      }
    }

    // 4. Cache HIT path: directly fetch and return result from database
    if (matchingModule) {
      console.log(`[MockTestRouter] Cache HIT: Found existing module ${matchingModule.id} with same content and marks distribution!`);
      const cachedMockTest = {
        ...matchingModule.mock_test,
        moduleId: matchingModule.id
      };
      return res.json(cachedMockTest);
    }

    // 5. Cache MISS path: generate a brand new Mock Test
    console.log(`[MockTestRouter] Cache MISS: Generating new question paper for ${topic || 'Custom Syllabus'}`);
    const result = await generateMockTest(sourceText, {
      maxMarks: parsedMaxMarks,
      distribution: parsedDistribution,
      instructions
    });

    if (result.error) {
      return res.json({ error: result.error });
    }

    const mockTestObj: {
      id: string;
      topic: string;
      maxMarks: number;
      instructions: string;
      questions: any[];
      isEvaluated: boolean;
      moduleId?: string;
    } = {
      id: uuidv4(),
      topic: topic || 'Custom Syllabus Exam',
      maxMarks: parsedMaxMarks,
      instructions: instructions || '',
      questions: result.questions?.map((q: any) => ({
        id: 'q_' + uuidv4(),
        ...q
      })) || [],
      isEvaluated: false
    };

    // 6. Fast-Create Module: Reuse existing study materials if available, otherwise generate fresh
    if (sourceModuleForContent) {
      console.log(`[MockTestRouter] Fast-creating new module using existing study materials from ${sourceModuleForContent.id}`);
      const newModuleId = uuidv4();
      await supabase.from('modules').insert({
        id: newModuleId,
        user_id: req.user!.id,
        topic: sourceModuleForContent.topic,
        persona: sourceModuleForContent.persona,
        source: sourceModuleForContent.source,
        master_context: sourceModuleForContent.master_context,
        text_content: sourceModuleForContent.text_content,
        slides: [],
        mindmap: sourceModuleForContent.mindmap,
        audio: sourceModuleForContent.audio,
        progress: 0,
        from_upload: true,
        status: 'complete',
        mock_test: mockTestObj
      });
      mockTestObj.moduleId = newModuleId;
    } else {
      // Generate standard learning hub components fresh
      try {
        const defaultPersona = parsedPersona || { grade: 'College', interest: 'everyday life' };
        const { source, masterContext } = await runPhase1(topic || 'Custom Syllabus', defaultPersona, true, {
          topic: topic || 'Custom Syllabus',
          sourceTitle: 'Uploaded Syllabus',
          sourceExcerpt: sourceText,
          sourceUrl: null
        });
        const { textContent, mindmap, audio } = await runPhase2(source, masterContext, defaultPersona);
        
        const newModuleId = uuidv4();
        await supabase.from('modules').insert({
          id: newModuleId,
          user_id: req.user!.id,
          topic: topic || 'Custom Syllabus',
          persona: defaultPersona,
          source,
          master_context: masterContext,
          text_content: textContent,
          slides: [],
          mindmap,
          audio,
          progress: 0,
          from_upload: true,
          status: 'complete',
          mock_test: mockTestObj
        });
        mockTestObj.moduleId = newModuleId;
      } catch (err: any) {
        console.warn('[MockTestRouter] Dynamic module generation failed, returning only mock test:', err.message);
      }
    }

    res.json(mockTestObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

mockTestRouter.post('/evaluate', async (req, res) => {
  try {
    const { moduleId, userAnswers } = req.body;
    if (!moduleId || !userAnswers) {
      return res.status(400).json({ error: 'moduleId and userAnswers are required.' });
    }

    // 1. Fetch mock test from the module
    const { data: moduleData, error: fetchError } = await supabase
      .from('modules')
      .select('mock_test')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !moduleData || !moduleData.mock_test) {
      return res.status(404).json({ error: 'Mock test not found for this module.' });
    }

    const mockTest = moduleData.mock_test;
    
    // 2. Evaluate answers
    const evaluationResult = await evaluateMockTestAnswers(mockTest.questions, userAnswers);

    // 3. Build the evaluated mock test object
    const evaluatedQuestions = mockTest.questions.map((q: any) => {
      const qEval = evaluationResult.evaluations[q.id] || {
        marksObtained: 0,
        feedback: 'No evaluation provided.',
        stepGrades: q.stepMarking.map((sm: any) => ({ step: sm.step, marksObtained: 0, feedback: 'No feedback.' }))
      };
      return {
        ...q,
        userAnswer: userAnswers[q.id] || '',
        evaluation: qEval
      };
    });

    const evaluatedMockTest = {
      ...mockTest,
      questions: evaluatedQuestions,
      score: evaluationResult.score,
      isEvaluated: true
    };

    // 4. Update in database
    const { error: updateError } = await supabase
      .from('modules')
      .update({ mock_test: evaluatedMockTest })
      .eq('id', moduleId);

    if (updateError) throw new Error(updateError.message);

    res.json(evaluatedMockTest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
