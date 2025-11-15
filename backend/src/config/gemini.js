// src/config/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAIKey = new GoogleGenerativeAI(
  'AIzaSyAy4pHPJEPWWDXHWw06MTGs4q4RYSTJM_M',
);

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/**
 * Enhanced Gemini AI function with retry logic and error handling
 */
export async function generateContent(prompt, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const model = genAIKey.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        ...options,
      });

      console.log(
        `Gemini API attempt ${attempt} for prompt length: ${prompt.length}`,
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log(`Gemini API success on attempt ${attempt}`);
      return response.text();
    } catch (error) {
      lastError = error;

      // Log the error
      console.warn(`Gemini API attempt ${attempt} failed:`, {
        status: error.status,
        message: error.message,
        stack: error.stack,
      });

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if ([400, 401, 403].includes(error?.status)) {
        throw error;
      }

      // If it's the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1) +
          Math.random() * 1000,
        RETRY_CONFIG.maxDelay,
      );

      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Backward compatibility
export async function genAI(prompt) {
  return generateContent(prompt);
}

export { genAI as default };
