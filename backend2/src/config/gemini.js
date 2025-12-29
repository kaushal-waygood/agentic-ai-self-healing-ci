import { GeminiUsage } from '../models/GeminiUsage.js';
import { getLLMProvider } from '../llm/providerFactory.js';
import fs from 'fs';
import path from 'path';

const provider = getLLMProvider();

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

// ===== PROMPT LOGGING SETUP =====
const PROMPT_LOG_DIR = path.resolve(process.cwd(), 'logs');
const PROMPT_LOG_FILE = path.join(PROMPT_LOG_DIR, 'prompt.txt');

function logPromptToFile(prompt, meta = {}) {
  try {
    if (!fs.existsSync(PROMPT_LOG_DIR)) {
      fs.mkdirSync(PROMPT_LOG_DIR, { recursive: true });
    }

    const entry = `
==============================
TIMESTAMP: ${new Date().toISOString()}
USER_ID: ${meta.userId || 'N/A'}
ENDPOINT: ${meta.endpoint || 'N/A'}
==============================
${prompt}

`;

    fs.appendFile(PROMPT_LOG_FILE, entry, () => {});
  } catch {
    // Silent failure. Logging must never break generation.
  }
}
// ===============================

function estimateTokens(text, mode = 'text') {
  if (!text) return 0;
  const charsPerToken = mode === 'code' ? 3 : 4;
  return Math.ceil(text.length / charsPerToken);
}

const breaker = {
  state: 'CLOSED',
  failures: 0,
  lastFailureAt: 0,
};

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

function canCallLLM() {
  if (breaker.state === 'OPEN') {
    if (Date.now() - breaker.lastFailureAt > COOLDOWN_MS) {
      breaker.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  return true;
}

function onSuccess() {
  breaker.state = 'CLOSED';
  breaker.failures = 0;
}

function onFailure() {
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
  if (!canCallLLM()) {
    throw new Error('LLM temporarily disabled (circuit breaker open)');
  }

  // 🔥 LOG PROMPT HERE
  logPromptToFile(prompt, { userId, endpoint });

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

  let lastError;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const start = Date.now();

    try {
      const { text, usage } = await provider.generate(prompt, {
        temperature,
        topK,
        topP,
      });

      const latencyMs = Date.now() - start;

      GeminiUsage.create({
        llm: provider.constructor.name,
        model: provider.model,
        promptChars,
        promptTokens: usage.promptTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        latencyMs,
        userId,
        endpoint,
      }).catch(() => {});

      onSuccess();
      return text;
    } catch (err) {
      lastError = err;
      onFailure();

      const status = err?.status;

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
