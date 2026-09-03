import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Standard Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables.');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
] as const;

/**
 * Executes content generation across the model fallback ladder to guarantee resilience
 */
async function generateContentWithFallback(params: {
  contents: any[];
  systemInstruction?: string;
  responseMimeType?: string;
}) {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
        },
      });

      return {
        text: response.text || '',
        modelUsed: model,
      };
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.statusCode || error?.response?.status;
      const errorMessage = String(error?.message || '');
      console.warn(`[Gemini Fallback] Model ${model} failed (Status: ${status}, Message: ${errorMessage}). Attempting next model...`);
      // Retry on standard transient status codes or continue down ladder
      continue;
    }
  }

  throw new Error(`All Gemini models in fallback ladder exhausted. Last error: ${lastError?.message || 'Unknown error'}`);
}

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Gemini Reflect & Brainstorm Endpoint
app.post('/api/gemini/reflect', async (req: Request, res: Response) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const category = typeof body.category === 'string' ? body.category : 'Reflection';
    const entryTitle = typeof body.entryTitle === 'string' ? body.entryTitle : 'Journal Reflection';
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return res.status(400).json({ error: 'A prompt or journal text is required.' });
    }

    // Prepare system instruction based on journal category and purpose
    const systemInstruction = `You are an empathetic, insightful, and constructive AI Reflection & Journal Assistant.
Your purpose is to help the user reflect deeply, brainstorm solutions, organize thoughts, and identify growth opportunities.
Current Journal Context:
- Entry Title: "${entryTitle}"
- Category: "${category}"

Guidelines:
1. Provide a warm, thoughtful, and analytical response ("reply") directly addressing the user's reflection or brainstorming request.
2. Formulate a brief, crisp 1-sentence summary of the user's situation or realization ("summary").
3. Extract 2 to 4 actionable insights, mindsets, or key realizations ("keyInsights").
4. Provide 2 or 3 provocative, open-ended questions to deepen the user's reflection ("suggestedPrompts").
5. Return the result strictly in valid JSON format matching this schema:
{
  "reply": "string (Markdown supported)",
  "summary": "string",
  "keyInsights": ["string"],
  "suggestedPrompts": ["string"]
}`;

    // Format conversation history for multi-turn dialogue
    const contents: any[] = [];

    for (const item of history) {
      if (item && item.content) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(item.content) }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    let parsedResponse: any = {};
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      // Fallback if JSON parse failed
      parsedResponse = {
        reply: result.text,
        summary: prompt.slice(0, 100) + '...',
        keyInsights: ['Continued personal inquiry'],
        suggestedPrompts: ['What feelings arise as you reflect on this?', 'What is the very next action you want to take?'],
      };
    }

    return res.json({
      reply: parsedResponse.reply || result.text,
      summary: parsedResponse.summary || '',
      keyInsights: Array.isArray(parsedResponse.keyInsights) ? parsedResponse.keyInsights : [],
      suggestedPrompts: Array.isArray(parsedResponse.suggestedPrompts) ? parsedResponse.suggestedPrompts : [],
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('API /api/gemini/reflect error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate reflection with Gemini API.',
    });
  }
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
