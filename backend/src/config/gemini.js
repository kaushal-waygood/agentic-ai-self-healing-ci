// src/config/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

// NOTE: keep your key management secure. The example below follows the original structure.
// Consider loading credentials from environment variables or a secrets manager.
const genAIKey = new GoogleGenerativeAI(config.geminiAPI);

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/**
 * Enhanced Gemini AI function with retry logic and error handling
 *
 * prompt: string or structured prompt acceptable by underlying SDK
 * options: { model, generationConfig, temperature, maxOutputTokens, ... }
 */
export async function generateContent(prompt, options = {}) {
  const promptLen = String(prompt || '').length || 0;
  console.log(`Gemini request prompt length=${promptLen}`);

  // Hard safety check - encourage callers to sanitize first
  const PROMPT_HARD_LIMIT = 200000;
  if (promptLen > PROMPT_HARD_LIMIT) {
    const err = new Error(
      `Prompt too large (${promptLen} chars). Please sanitize before sending.`,
    );
    err.status = 400;
    throw err;
  }

  // conservative defaults; callers may override via options.generationConfig
  const generationConfig = {
    temperature: options.temperature ?? 0.4,
    topK: options.topK ?? 40,
    topP: options.topP ?? 0.95,
    ...(options.generationConfig || {}),
  };

  let lastError;
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const model = genAIKey.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig,
      });

      console.log(
        `Gemini API attempt ${attempt} for prompt length: ${promptLen}`,
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log(`Gemini API success on attempt ${attempt}`);
      return response.text();
    } catch (error) {
      lastError = error;
      const status = error?.status;
      console.warn(`Gemini API attempt ${attempt} failed:`, {
        status,
        message: error?.message,
      });

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if ([400, 401, 403].includes(status)) {
        throw error;
      }

      if (attempt === RETRY_CONFIG.maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter; longer base for 429
      const base =
        status === 429 ? RETRY_CONFIG.baseDelay * 2 : RETRY_CONFIG.baseDelay;
      const delay = Math.min(
        base * Math.pow(2, attempt - 1) + Math.random() * 1000,
        RETRY_CONFIG.maxDelay,
      );

      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Backward compatibility: accept options param to allow callers to pass generation overrides
export async function genAI(prompt, options = {}) {
  return generateContent(prompt, options);
}

export { genAI as default };
