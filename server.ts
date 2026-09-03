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
    const systemInstruction = `You are an empathetic, insightful, and psychologically grounded AI Reflection & Journal Assistant.
Your purpose is to help the user reflect deeply, identify unconscious cognitive habits/biases, track emotional resonance, brainstorm solutions, and cultivate self-awareness.
Current Journal Context:
- Entry Title: "${entryTitle}"
- Category: "${category}"

Guidelines:
1. Provide a warm, thoughtful, and analytical response ("reply") directly addressing the user's reflection or inquiry.
2. Formulate a crisp 1-2 sentence summary of the core reflection ("summary").
3. Extract 2 to 4 actionable insights or key realizations ("keyInsights").
4. Provide 2 or 3 provocative, open-ended questions to deepen the user's reflection ("suggestedPrompts").
5. Perform a Cognitive Bias & Blind-Spot analysis ("cognitiveRadar"):
   - Evaluate these 6 cognitive dimensions on a 0-100 scale (where 0 means absent, 100 means heavy presence):
     - "All-or-Nothing" (Black & white thinking)
     - "Catastrophizing" (Assuming the worst outcome)
     - "Control Fallacy" (Assuming total blame or complete helplessness)
     - "Confirmation Bias" (Filtering out positive/alternative evidence)
     - "Emotional Reasoning" (Assuming feelings dictate reality)
     - "Rigid Demands" ("Should" or "Must" imperatives)
   - Identify the "dominantPattern" (e.g. "Rigid Demands" or "Balanced Inquiry").
   - Provide a constructive, compassionate "reframeInsight" suggesting a healthier perspective.
6. Perform an Emotional Resonance analysis ("emotionalResonance"):
   - "primaryTone": e.g., "Reflective & Grounded", "Apprehensive but Curious", "Energized & Motivated".
   - "energyLevel": One of "Low", "Moderate", "Elevated", "High".
   - "valenceScore": 0-100 score indicating overall emotional positivity/clarity.
   - "metrics": array of 4 objects for traits "Clarity", "Calm", "Optimism", "Agency", each with score 0-100.
   - "resonanceNote": 1-2 sentence guidance for emotional balance and positive forward momentum.

Return the result strictly in valid JSON format matching this schema:
{
  "reply": "string (Markdown supported)",
  "summary": "string",
  "keyInsights": ["string"],
  "suggestedPrompts": ["string"],
  "cognitiveRadar": {
    "dimensions": [
      { "name": "All-or-Nothing", "score": number, "description": "string" },
      { "name": "Catastrophizing", "score": number, "description": "string" },
      { "name": "Control Fallacy", "score": number, "description": "string" },
      { "name": "Confirmation Bias", "score": number, "description": "string" },
      { "name": "Emotional Reasoning", "score": number, "description": "string" },
      { "name": "Rigid Demands", "score": number, "description": "string" }
    ],
    "dominantPattern": "string",
    "reframeInsight": "string"
  },
  "emotionalResonance": {
    "primaryTone": "string",
    "energyLevel": "Low" | "Moderate" | "Elevated" | "High",
    "valenceScore": number,
    "metrics": [
      { "trait": "Clarity", "score": number },
      { "trait": "Calm", "score": number },
      { "trait": "Optimism", "score": number },
      { "trait": "Agency", "score": number }
    ],
    "resonanceNote": "string"
  }
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
        keyInsights: ['Continued personal inquiry and thoughtful reflection'],
        suggestedPrompts: [
          'What underlying assumption might you test next?',
          'What feelings arise as you reflect on this?',
        ],
      };
    }

    // Defensive fallback defaults for cognitiveRadar
    const defaultCognitiveDimensions = [
      { name: 'All-or-Nothing', score: 20, description: 'Tendency to see situations in polarized absolutes' },
      { name: 'Catastrophizing', score: 15, description: 'Anticipating worst-case scenarios disproportionately' },
      { name: 'Control Fallacy', score: 25, description: 'Assuming disproportionate responsibility or helplessness' },
      { name: 'Confirmation Bias', score: 20, description: 'Fixating on thoughts supporting current perspective' },
      { name: 'Emotional Reasoning', score: 30, description: 'Interpreting emotional feelings as objective reality' },
      { name: 'Rigid Demands', score: 25, description: 'Applying rigid should/must expectations to yourself' },
    ];

    const cognitiveRadar = (parsedResponse.cognitiveRadar && typeof parsedResponse.cognitiveRadar === 'object')
      ? {
          dimensions: Array.isArray(parsedResponse.cognitiveRadar.dimensions) && parsedResponse.cognitiveRadar.dimensions.length > 0
            ? parsedResponse.cognitiveRadar.dimensions.map((d: any) => ({
                name: typeof d.name === 'string' ? d.name : 'Dimension',
                score: typeof d.score === 'number' ? Math.max(0, Math.min(100, Math.round(d.score))) : 20,
                description: typeof d.description === 'string' ? d.description : '',
              }))
            : defaultCognitiveDimensions,
          dominantPattern: typeof parsedResponse.cognitiveRadar.dominantPattern === 'string'
            ? parsedResponse.cognitiveRadar.dominantPattern
            : 'Balanced Inquiry',
          reframeInsight: typeof parsedResponse.cognitiveRadar.reframeInsight === 'string'
            ? parsedResponse.cognitiveRadar.reframeInsight
            : 'Consider testing these reflections against multiple alternative hypotheses to retain mental flexibility.',
        }
      : {
          dimensions: defaultCognitiveDimensions,
          dominantPattern: 'Balanced Inquiry',
          reframeInsight: 'Keep observing your thought loops with gentle curiosity rather than judgment.',
        };

    // Defensive fallback defaults for emotionalResonance
    const defaultEmotionalMetrics = [
      { trait: 'Clarity', score: 65 },
      { trait: 'Calm', score: 60 },
      { trait: 'Optimism', score: 70 },
      { trait: 'Agency', score: 75 },
    ];

    const emotionalResonance = (parsedResponse.emotionalResonance && typeof parsedResponse.emotionalResonance === 'object')
      ? {
          primaryTone: typeof parsedResponse.emotionalResonance.primaryTone === 'string'
            ? parsedResponse.emotionalResonance.primaryTone
            : 'Reflective & Grounded',
          energyLevel: ['Low', 'Moderate', 'Elevated', 'High'].includes(parsedResponse.emotionalResonance.energyLevel)
            ? parsedResponse.emotionalResonance.energyLevel
            : 'Moderate',
          valenceScore: typeof parsedResponse.emotionalResonance.valenceScore === 'number'
            ? Math.max(0, Math.min(100, Math.round(parsedResponse.emotionalResonance.valenceScore)))
            : 65,
          metrics: Array.isArray(parsedResponse.emotionalResonance.metrics) && parsedResponse.emotionalResonance.metrics.length > 0
            ? parsedResponse.emotionalResonance.metrics.map((m: any) => ({
                trait: typeof m.trait === 'string' ? m.trait : 'Trait',
                score: typeof m.score === 'number' ? Math.max(0, Math.min(100, Math.round(m.score))) : 60,
              }))
            : defaultEmotionalMetrics,
          resonanceNote: typeof parsedResponse.emotionalResonance.resonanceNote === 'string'
            ? parsedResponse.emotionalResonance.resonanceNote
            : 'Acknowledging your current emotional state is the foundational first step to unlocking agency.',
        }
      : {
          primaryTone: 'Reflective & Grounded',
          energyLevel: 'Moderate' as const,
          valenceScore: 65,
          metrics: defaultEmotionalMetrics,
          resonanceNote: 'Continue writing to deepen your emotional clarity and ground your intentions.',
        };

    return res.json({
      reply: parsedResponse.reply || result.text,
      summary: parsedResponse.summary || '',
      keyInsights: Array.isArray(parsedResponse.keyInsights) ? parsedResponse.keyInsights : [],
      suggestedPrompts: Array.isArray(parsedResponse.suggestedPrompts) ? parsedResponse.suggestedPrompts : [],
      cognitiveRadar,
      emotionalResonance,
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
