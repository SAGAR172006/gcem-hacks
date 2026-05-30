import { callGeminiJSON } from '../services/gemini';

export interface QuestionDistribution {
  marks: number;
  count: number;
}

export interface MockTestAgentConfig {
  maxMarks: number;
  distribution: QuestionDistribution[];
  instructions?: string;
}

export interface MockTestQuestion {
  id: string;
  marks: number;
  question: string;
  suggestedAnswer: string;
  stepMarking: { step: string; marks: number }[];
  difficultyRating?: number;
  userAnswer?: string;
  evaluation?: {
    marksObtained: number;
    feedback: string;
    stepGrades: { step: string; marksObtained: number; feedback: string }[];
  };
}

export interface MockTestResponse {
  error?: string; // Set if syllabus is invalid
  questions?: {
    marks: number;
    question: string;
    suggestedAnswer: string;
    stepMarking: { step: string; marks: number }[];
    difficultyRating: number;
  }[];
}

export interface UserAnswerEvaluation {
  marksObtained: number;
  feedback: string;
  stepGrades: { step: string; marksObtained: number; feedback: string }[];
}

export interface EvaluationResult {
  score: number;
  evaluations: Record<string, UserAnswerEvaluation>;
}

/**
 * Generates a mock test question paper based on the syllabus/source text and distribution configuration.
 */
export async function generateMockTest(
  sourceText: string,
  config: MockTestAgentConfig
): Promise<MockTestResponse> {
  const distributionStr = config.distribution.map(d => `${d.count} questions worth ${d.marks} marks each`).join(', ');

  const prompt = [
    'You are an expert AI Examiner and Question Paper Generator.',
    'Your task is to analyze the following syllabus text or topic content and generate a highly rigorous, well-structured, and accurate question paper.',
    '',
    '=== SYLLABUS / SOURCE CONTENT ===',
    sourceText.slice(0, 8000),
    '=== END CONTENT ===',
    '',
    '=== CONFIGURATION ===',
    `Max Marks: ${config.maxMarks}`,
    `Questions Distribution Required: ${distributionStr}`,
    config.instructions ? `User Custom Instructions: ${config.instructions}` : '',
    '',
    'CRITICAL SYLLABUS VALIDATION RULE:',
    'If the provided content does not contain a properly defined syllabus, structure, or different topics (i.e. it is just gibberish, an empty file, or entirely lacking educational topic structures), you MUST set the "error" field in the output JSON to:',
    '"upload a document which should either have properly defined syllabus or different topics."',
    'Do not generate questions in this case.',
    '',
    'GENERATION RULES:',
    `1. Generate exactly the number of questions specified in the distribution. The total marks MUST equal ${config.maxMarks}.`,
    '2. Each question must have a proportional complexity. For higher marks (e.g. 5-10 marks), the question must be deep, requiring step-by-step mathematical, programmatic, or analytical reasoning.',
    '3. For each question, provide:',
    '   - "question": The clear question text.',
    '   - "marks": The mark value for this question.',
    '   - "suggestedAnswer": A comprehensive model answer displaying a step-by-step resolution.',
    '   - "stepMarking": A detailed array of steps, where each step lists "step" (the descriptive explanation of what the student needs to show in this step to get credit) and "marks" (the integer marks assigned to this specific step). The sum of all step marks MUST EXACTLY equal the question\'s marks.',
    '   - "difficultyRating": An integer from 1 to 5 indicating the specific difficulty of this question (1 = very easy, 5 = extremely challenging).',
    '',
    'Output STRICTLY as a raw JSON object matching the schema below (no markdown code blocks, no explanation):',
    '{',
    '  "error": null,',
    '  "questions": [',
    '    {',
    '      "question": "Question text here",',
    '      "marks": 5,',
    '      "suggestedAnswer": "Step 1: ... Step 2: ...",',
    '      "stepMarking": [',
    '        { "step": "Identify the formula and key variables", "marks": 1 },',
    '        { "step": "Substitute variables and calculate intermediate results", "marks": 2 },',
    '        { "step": "Provide final answer with correct units", "marks": 2 }',
    '      ],',
    '      "difficultyRating": 3',
    '    }',
    '  ]',
    '}'
  ].filter(Boolean).join('\n');

  try {
    console.log('[MockTestAgent] Launching Mock Test Generation...');
    const result = await callGeminiJSON<MockTestResponse>(prompt);
    return result;
  } catch (err: any) {
    console.error('[MockTestAgent] Error generating mock test:', err.message);
    throw new Error('[MockTestAgent] Failed to generate mock test: ' + err.message);
  }
}

/**
 * Evaluates a set of user answers against a mock test's questions and step-marking guides.
 */
export async function evaluateMockTestAnswers(
  questions: MockTestQuestion[],
  userAnswers: Record<string, string>
): Promise<EvaluationResult> {
  const questionsPromptData = questions.map((q, idx) => {
    return [
      `Question ${idx + 1} (Marks: ${q.marks}) [ID: ${q.id}]:`,
      `Question: ${q.question}`,
      `Model Answer: ${q.suggestedAnswer}`,
      `Step Marking Guide:`,
      ...q.stepMarking.map((sm: any, smIdx: number) => `  - Step ${smIdx + 1} (${sm.marks} marks): ${sm.step}`),
      `Student's Answer: ${userAnswers[q.id] || '(No Answer Provided)'}`,
      ''
    ].join('\n');
  }).join('\n---\n\n');

  const prompt = [
    'You are an expert, strict human-like grader.',
    'Your task is to evaluate the student\'s answers against the Model Answers and Step Marking Guide.',
    'Be extremely precise, giving credit for intermediate steps only if the student demonstrated understanding of that step.',
    '',
    '=== QUESTIONS AND ANSWERS ===',
    questionsPromptData,
    '=== END ===',
    '',
    'GRADING RULES:',
    '1. For each question, review each item in the "stepMarking" array.',
    '2. Assign a "marksObtained" (integer) for each step based on the student\'s answer. If the step is fully correct, award full marks for that step. If partially correct, you can award partial marks. If completely incorrect/absent, award 0.',
    '3. The sum of step marks obtained will be the total marks obtained for that question.',
    '4. Provide specific constructive feedback explaining why points were awarded or lost for each step.',
    '',
    'Output STRICTLY as a raw JSON object matching the schema below (no markdown code blocks, no explanation):',
    '{',
    '  "evaluations": {',
    '    "question_id_here": {',
    '      "marksObtained": 3,',
    '      "feedback": "Overall good attempt, but missed the final calculation step.",',
    '      "stepGrades": [',
    '        { "step": "Identify formula", "marksObtained": 1, "feedback": "Correct formula identified." },',
    '        { "step": "Intermediate calculations", "marksObtained": 2, "feedback": "Steps completed correctly." },',
    '        { "step": "Final calculation", "marksObtained": 0, "feedback": "Final result was incorrect." }',
    '      ]',
    '    }',
    '  }',
    '}'
  ].join('\n');

  try {
    console.log('[MockTestAgent] Evaluating student answers...');
    const result = await callGeminiJSON<any>(prompt);
    
    let totalScore = 0;
    const evaluations: Record<string, UserAnswerEvaluation> = {};

    for (const q of questions) {
      const qEval = result.evaluations?.[q.id] || {
        marksObtained: 0,
        feedback: 'No evaluation generated.',
        stepGrades: q.stepMarking.map((sm: any) => ({ step: sm.step, marksObtained: 0, feedback: 'No feedback.' }))
      };
      
      // Ensure marksObtained doesn't exceed question marks
      qEval.marksObtained = Math.min(q.marks, Math.max(0, qEval.marksObtained));
      totalScore += qEval.marksObtained;
      evaluations[q.id] = qEval;
    }

    return {
      score: totalScore,
      evaluations
    };
  } catch (err: any) {
    console.error('[MockTestAgent] Error evaluating answers:', err.message);
    throw new Error('[MockTestAgent] Failed to evaluate answers: ' + err.message);
  }
}
