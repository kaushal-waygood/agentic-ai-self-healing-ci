import { genAI } from '../config/gemini.js';

export const genAIWithRetry = async (prompt, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await genAI(prompt);
    } catch (error) {
      lastError = error;
      if (error.status === 503 || error.status === 500) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};
