import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { getChatKeyIndex } from '../services/gemini';

export const chatRouter = Router();

// Require auth for all chat endpoints
chatRouter.use(requireAuth);

chatRouter.post('/embed/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // 1. Fetch the module from Supabase
    const { data: moduleData, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !moduleData) return res.status(404).json({ error: 'Module not found' });

    // 2. Split textContent into chunks
    const chunks: { text: string; source: string }[] = [];
    
    const textContent = moduleData.text_content;
    const slides = moduleData.slides;

    if (textContent && textContent.sections) {
      for (const section of textContent.sections) {
        if (section.kind === 'prose' && section.body) {
          chunks.push({ text: section.body, source: 'text' });
        } else if (section.kind === 'inline-quiz') {
          const quizText = `Question: ${section.question}\nHint: ${section.hint}\nChoices: ${section.choices?.map((c: any) => c.text).join(', ')}`;
          chunks.push({ text: quizText, source: 'text' });
        }
      }
    }

    if (slides) {
      for (const slide of slides) {
        if (slide.narration) {
          chunks.push({ text: `Slide Narration (${slide.title}): ${slide.narration}`, source: 'slides' });
        }
      }
    }

    // 3. Generate embeddings — use dedicated chat key
    const chatKeyIdx = getChatKeyIndex();
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiKeys[chatKeyIdx],
      modelName: 'embedding-001'
    });

    let chunksEmbedded = 0;

    for (const chunk of chunks) {
      const vector = await embeddings.embedQuery(chunk.text);

      // 4. Insert into Supabase embeddings table
      const { error: insertError } = await supabase.from('embeddings').insert({
        module_id: moduleId,
        chunk_text: chunk.text,
        embedding: vector,
        metadata: { source: chunk.source }
      });

      if (insertError) {
        console.error('Error inserting embedding:', insertError);
      } else {
        chunksEmbedded++;
      }
    }

    // 5. Return success
    res.json({ success: true, chunksEmbedded });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

chatRouter.post('/', async (req, res) => {
  try {
    const { moduleId, message, history } = req.body;

    // 1. Fetch module from Supabase
    const { data: moduleData, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !moduleData) return res.status(404).json({ error: 'Module not found' });

    // 2. Generate embedding for the user's message — use dedicated chat key
    const chatKeyIdx = getChatKeyIndex();
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiKeys[chatKeyIdx],
      modelName: 'embedding-001'
    });
    const messageEmbedding = await embeddings.embedQuery(message);

    // 3. Call the match_embeddings Supabase function
    const { data: matchedChunks, error: rpcError } = await supabase.rpc('match_embeddings', {
      query_embedding: messageEmbedding,
      match_module_id: moduleId,
      match_count: 5
    });

    if (rpcError) throw new Error(rpcError.message);

    // 4. Build context from the top 5 matched chunks
    const retrievedChunks = matchedChunks || [];
    const contextText = retrievedChunks.map((c: any) => c.chunk_text).join('\n\n');

    // 5. Build the system prompt
    const topic = moduleData.topic || 'this topic';
    const systemPrompt = `You are AMI, a focused AI tutor. Your ONLY job is to help the student understand: ${topic}

Here is the relevant content from the student's study material:
${contextText}

Rules:
- Only answer questions directly related to ${topic}
- If the student asks about something unrelated, politely say you can only discuss ${topic} in this session
- Keep answers friendly and appropriate for: ${moduleData.persona?.grade || 'a general student'}
- Use analogies related to: ${moduleData.persona?.interest || 'everyday life'} when helpful
- Be concise — 2-4 sentences unless a longer answer is clearly needed`;

    // 6. Build conversation turns from history (last 10 messages max)
    const recentHistory = (history || []).slice(-10);
    const conversationHistory = recentHistory.map((msg: any) => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 7. Call Gemini with dedicated chat key
    const genAI = new GoogleGenerativeAI(config.geminiKeys[chatKeyIdx]);
    const geminiModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    });

    const chat = geminiModel.startChat({ history: conversationHistory });
    const result = await chat.sendMessage(message);
    const replyText = result.response.text();

    // 8. Detect off-topic
    const lowerReply = replyText.toLowerCase();
    const isOffTopic = lowerReply.includes("i can only") || lowerReply.includes("let's focus on");

    // 9. Return
    res.json({ reply: replyText, isOffTopic });
  } catch (err: any) {
    console.error('[Chat] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
