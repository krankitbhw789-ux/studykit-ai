import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client with required User-Agent
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Supported models cascade for reliability (all within free/standard tier)
// Prioritize gemini-3.1-flash-lite as it provides immediate responsiveness and high throughput
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

// Helper to execute Gemini requests with retry and fallback across candidate models
async function generateWithFallback(ai: GoogleGenAI, requestPayload: any) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Requesting synthesis with model "${model}" (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          ...requestPayload,
          model,
        });

        if (response && response.text) {
          console.log(`[Gemini] Successfully generated content using model: ${model}`);
          return { response, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || err?.toString() || '';
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          err?.status === 503 ||
          err?.status === 429;

        console.log(`[Gemini] Model "${model}" is temporarily busy or unavailable. Routing to next option.`);

        if (isTransient && attempt === 1) {
          // Brief pause before trying alternate attempt/model
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        // Move to next candidate model
        break;
      }
    }
  }

  throw lastError || new Error('All candidate AI models were unavailable.');
}

// StudyKit JSON Schema
const studyKitResponseSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: 'Subject matter category, e.g., Neuroscience, Economics, History' },
    estimatedPages: { type: Type.STRING, description: 'Estimated page count string, e.g., "12 pages"' },
    summary: {
      type: Type.OBJECT,
      properties: {
        overview: { type: Type.STRING, description: 'Executive paragraph summary of the document' },
        keyTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of 4-6 key takeaways from the text',
        },
        readingTimeMinutes: { type: Type.NUMBER, description: 'Estimated reading time in minutes' },
      },
      required: ['overview', 'keyTakeaways'],
    },
    notes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          romanNumeral: { type: Type.STRING, description: 'e.g. I, II, III' },
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          bullets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: 'Short bold title/label of the bullet' },
                text: { type: Type.STRING, description: 'Detailed bullet content' },
              },
              required: ['label', 'text'],
            },
          },
          examKeyConcept: { type: Type.STRING },
        },
        required: ['id', 'romanNumeral', 'title', 'bullets'],
      },
    },
    importantTopics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.NUMBER },
          title: { type: Type.STRING },
          reason: { type: Type.STRING, description: 'One-line reason why this topic matters for exams' },
          yieldLevel: { type: Type.STRING, description: 'Critical, High Yield, or Medium' },
          examFrequency: { type: Type.STRING, description: 'e.g. High Frequency (85%)' },
          keyTerms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['rank', 'title', 'reason', 'yieldLevel', 'keyTerms'],
      },
    },
    mindMap: {
      type: Type.OBJECT,
      properties: {
        root: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            sectionRef: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['title', 'subtitle', 'description'],
        },
        branches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              romanNumeral: { type: Type.STRING },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              tag: { type: Type.STRING },
              examBadge: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tag: { type: Type.STRING },
                    sourceCitation: { type: Type.STRING },
                    excerptText: { type: Type.STRING },
                    pageRef: { type: Type.STRING },
                  },
                  required: ['id', 'label', 'title', 'description'],
                },
              },
            },
            required: ['id', 'romanNumeral', 'title', 'keyPoints'],
          },
        },
      },
      required: ['root', 'branches'],
    },
    testSeries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          questionNumber: { type: Type.NUMBER },
          type: { type: Type.STRING, description: 'mcq or short-answer' },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          topicRef: { type: Type.STRING },
        },
        required: ['id', 'questionNumber', 'type', 'question', 'correctAnswer', 'explanation'],
      },
    },
  },
  required: ['summary', 'notes', 'importantTopics', 'mindMap', 'testSeries'],
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Primary StudyKit Document Synthesis endpoint
app.post('/api/studykit/generate', async (req: Request, res: Response) => {
  try {
    const { pdfBase64, filename, fileSize, mimeType = 'application/pdf' } = req.body;

    if (!pdfBase64) {
      res.status(400).json({ error: 'No PDF file content provided.' });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are StudyKit AI, an expert academic synthesis engine designed for university students and educators.
Your task is to analyze the provided study material / PDF document and generate structured, comprehensive study modules in JSON format.
You must adhere strictly to these outputs:
1. Notes: Comprehensive bullet-point notes organized by section/heading as they appear in the document. For each section, provide a Roman numeral, title, subtitle, array of bullets (each with a bold concept label and clear explanation), and an optional exam key concept or figure note.
2. Summary: A thorough executive paragraph-style summary of the whole document, along with 4-6 high-yield key takeaways and estimated reading time.
3. Important Topics: A ranked list of 5-8 of the most exam-relevant topics from the document. Each topic must have a rank (1, 2, ...), title, one-line explanation of why it matters for exams, yield level ('Critical', 'High Yield', or 'Medium'), and key terms.
4. Mind Map: A hierarchical conceptual ontology tree. Provide a root node (title, subtitle, sectionRef, description) and 2 to 4 primary branches (each with romanNumeral, title, subtitle, tag, and 3-4 key points with label, title, description, excerptText from the document, and pageRef).
5. Test Series: 8 to 10 practice exam questions based directly on the document. Include a balanced mix of Multiple Choice Questions (type: "mcq", with 4 distinct options and one clear correctAnswer) and Conceptual Short-Answer Questions (type: "short-answer"). Each question MUST include a detailed explanation and the relevant topic reference.

Maintain high academic rigor, clear terminology, and factual fidelity to the uploaded document.`;

    const prompt = `Analyze the attached PDF document ("${filename || 'document.pdf'}") thoroughly and extract complete, high-quality StudyKit study materials.
Generate:
- notes (3 to 5 structured sections with detailed bullets)
- summary (concise paragraph overview + 4-6 key takeaways)
- importantTopics (ranked 1 to 5+ with clear exam reasons)
- mindMap (root ontology with 2-4 branches, each containing 3+ detailed key points with excerpts)
- testSeries (8-10 high-quality exam questions: mix of mcq and short-answer with full explanations)

Return ONLY valid JSON adhering to the requested schema.`;

    const { response, modelUsed } = await generateWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: studyKitResponseSchema,
      },
    });

    const rawText = response.text || '';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback: strip potential markdown code fences
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          parsedData = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
        } else {
          throw new Error('Unable to parse JSON from AI model response.');
        }
      }
    }

    // Format into standard StudyKitResult
    const result = {
      document: {
        fileName: filename || 'Uploaded_Document.pdf',
        fileSize: fileSize || 'Calculated during sync',
        pageCount: parsedData.estimatedPages || '18 pages',
        category: parsedData.category || 'General Study',
        uploadedAt: 'Analyzed just now',
        modelEngine: modelUsed,
      },
      notes: parsedData.notes || [],
      summary: {
        overview: parsedData.summary?.overview || '',
        keyTakeaways: parsedData.summary?.keyTakeaways || [],
        readingTimeMinutes: parsedData.summary?.readingTimeMinutes || 7,
        estimatedPages: parseInt(parsedData.estimatedPages, 10) || 18,
      },
      topics: parsedData.importantTopics || [],
      mindMap: parsedData.mindMap || {
        root: {
          title: filename || 'Core Subject Matter',
          subtitle: 'Ontological Root',
          sectionRef: 'Full Text',
          description: 'Synthesized core knowledge hierarchy.',
        },
        branches: [],
      },
      testSeries: parsedData.testSeries || [],
    };

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('StudyKit synthesis error:', error);
    const rawError = error?.message || error?.toString() || '';

    let userFriendlyError = 'Failed to synthesize document study material.';
    if (rawError.includes('503') || rawError.includes('high demand') || rawError.includes('UNAVAILABLE')) {
      userFriendlyError = 'The AI model is currently experiencing high demand. Please try again in a few moments.';
    } else if (rawError.includes('429') || rawError.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'API quota or rate limit exceeded. Please wait a moment and try again.';
    } else if (rawError.includes('GEMINI_API_KEY')) {
      userFriendlyError = 'Gemini API key is not configured or invalid.';
    } else if (error?.message) {
      userFriendlyError = error.message;
    }

    res.status(503).json({
      success: false,
      error: userFriendlyError,
      rawError: rawError,
    });
  }
});

// Single section retry endpoint for resilience
app.post('/api/studykit/retry-section', async (req: Request, res: Response) => {
  try {
    const { sectionType, contextSnippet, title } = req.body;
    const ai = getGeminiClient();

    const { response } = await generateWithFallback(ai, {
      contents: `Regenerate the ${sectionType} for the academic topic: "${title || 'Study Material'}". Context: ${contextSnippet || 'General college study material'}. Return detailed, accurate academic content in JSON format.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    res.status(503).json({ error: err?.message || 'Section retry failed.' });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyKit AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
