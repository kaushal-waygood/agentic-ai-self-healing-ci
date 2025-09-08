import { genAI } from '../config/gemini.js';

export const genAIWithRetry = async (prompt, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the API call
      return await genAI(prompt);
    } catch (error) {
      lastError = error;
      // Check if the error is a 503 or other retryable server error
      if (error.status === 503 || error.status === 500) {
        console.log(`Attempt ${attempt + 1} failed. Retrying after a delay...`);
        // Calculate delay: 1s, 2s, 4s... + random jitter
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // If it's a non-retryable error (e.g., 400 Bad Request), throw immediately
        throw error;
      }
    }
  }
  // If all retries fail, throw the last captured error
  throw lastError;
};
