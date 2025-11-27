// src/config/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAIKey = new GoogleGenerativeAI(config.geminiAPI);

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

export async function generateContent(prompt, options = {}) {
  const promptLen = String(prompt || '').length || 0;
  console.log(`Gemini request prompt length=${promptLen}`);

  const PROMPT_HARD_LIMIT = 200000;
  if (promptLen > PROMPT_HARD_LIMIT) {
    const err = new Error(
      `Prompt too large (${promptLen} chars). Please sanitize before sending.`,
    );
    err.status = 400;
    throw err;
  }

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
        model: 'gemini-2.5-flash',
      });

      console.log(
        `Gemini API attempt ${attempt} for prompt length: ${promptLen}`,
      );

      const result = await model.generateContent(prompt);

      console.log('Tokens Use', result);

      const response = result.response;

      const text = response.text();

      if (result.usageMetadata) {
        console.log('Token usage:', result.usageMetadata);
      } else {
        console.log('Token usage: none in response');
      }

      console.log(`Gemini API success on attempt ${attempt}`);
      return text; // ← THIS IS CRITICAL
    } catch (error) {
      lastError = error;
      const status = error?.status;
      console.warn(`Gemini API attempt ${attempt} failed:`, {
        status,
        message: error?.message,
      });

      if ([400, 401, 403].includes(status)) {
        throw error;
      }

      if (attempt === RETRY_CONFIG.maxRetries) {
        throw error;
      }

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

export async function genAI(prompt, options = {}) {
  return generateContent(prompt, options);
}

export { genAI as default };
