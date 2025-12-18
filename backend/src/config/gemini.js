import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiUsage } from '../models/GeminiUsage.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = 'gemini-2.5-flash';

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

function estimateTokens(text, mode = 'text') {
  if (!text) return 0;
  const charsPerToken = mode === 'code' ? 3 : 4;
  return Math.ceil(text.length / charsPerToken);
}

const breaker = {
  state: 'CLOSED', // CLOSED | OPEN | HALF_OPEN
  failures: 0,
  lastFailureAt: 0,
};

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

function canCallGemini() {
  if (breaker.state === 'OPEN') {
    if (Date.now() - breaker.lastFailureAt > COOLDOWN_MS) {
      breaker.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  return true;
}

function onGeminiSuccess() {
  breaker.state = 'CLOSED';
  breaker.failures = 0;
}

function onGeminiFailure() {
  breaker.failures += 1;
  breaker.lastFailureAt = Date.now();
  if (breaker.failures >= FAILURE_THRESHOLD) {
    breaker.state = 'OPEN';
  }
}

export async function generateContent(
  prompt,
  {
    userId,
    endpoint,
    temperature = 0.4,
    topK = 40,
    topP = 0.95,
    mode = 'text',
  } = {},
) {
  if (!canCallGemini()) {
    throw new Error('Gemini temporarily disabled (circuit breaker open)');
  }

  const promptChars = String(prompt || '').length;

  if (promptChars > 500_000) {
    const err = new Error(`Prompt too large (${promptChars} chars)`);
    err.status = 400;
    throw err;
  }

  const estimatedTokens = estimateTokens(prompt, mode);
  if (estimatedTokens > 120_000) {
    throw new Error(
      `Estimated prompt tokens too high (~${estimatedTokens}). Chunk it.`,
    );
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { temperature, topK, topP },
  });

  let lastError;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const start = Date.now();

    try {
      const result = await model.generateContent(prompt);
      const latencyMs = Date.now() - start;

      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      if (!usage) {
        throw new Error('Missing Gemini usage metadata');
      }

      const usageDoc = {
        model: MODEL_NAME,
        promptChars,
        promptTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
        latencyMs,
        userId,
        endpoint,
      };

      // Non-blocking DB write
      GeminiUsage.create(usageDoc).catch((err) => {
        console.error('Failed to store Gemini usage', err);
      });

      onGeminiSuccess();
      return text;
    } catch (err) {
      lastError = err;
      onGeminiFailure();

      const status = err?.status;

      console.warn(`Gemini attempt ${attempt} failed`, {
        status,
        message: err?.message,
      });

      if ([400, 401, 403].includes(status)) {
        throw err;
      }

      if (attempt === RETRY_CONFIG.maxRetries) {
        throw err;
      }

      const delay = Math.min(
        (status === 429 ? 2000 : RETRY_CONFIG.baseDelay) * 2 ** (attempt - 1),
        RETRY_CONFIG.maxDelay,
      );

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export async function genAIRequest(prompt, options = {}) {
  return generateContent(prompt, options);
}
