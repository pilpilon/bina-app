import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

// Simple in-memory rate limiting (Note: in serverless edge, this varies per isolate, 
// but provides basic protection against rapid-fire scripts hitting the same regional edge)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute per IP

  let userRecord = rateLimitMap.get(ip);
  if (!userRecord || now > userRecord.resetTime) {
    userRecord = { count: 0, resetTime: now + windowMs };
  }

  userRecord.count++;
  rateLimitMap.set(ip, userRecord);

  return userRecord.count <= maxRequests;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Basic IP rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { prompt, responseJson, modelType = "gemini-2.5-flash-lite", systemInstruction } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelOptions: any = { 
      model: modelType,
    };
    
    if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
    }

    // If expecting JSON, use native schema feature
    if (responseJson) {
      modelOptions.generationConfig = {
        responseMimeType: "application/json",
      };
    }

    // Lower blocking thresholds to avoid false positives on essays
    // (We use standard mapping string values for the Gemini SDK)
    modelOptions.safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
      { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_ONLY_HIGH' as any },
    ];

    const model = genAI.getGenerativeModel(modelOptions);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown AI error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
