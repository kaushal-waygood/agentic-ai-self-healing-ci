import { genAIRequest as genAI } from '../config/gemini.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const genAIWithRetry = async (generationConfig, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await genAI(generationConfig);
      return result;
    } catch (error) {
      attempt++;
      if (error.status === 503 && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(
          `Attempt ${attempt}: Model overloaded (503). Retrying in ${
            waitTime / 1000
          }s...`,
        );
        await delay(waitTime); // Wait before making the next attempt
      } else {
        console.error(
          `Attempt ${attempt}: Failed to generate content. Error: ${error.message}`,
        );
        throw error;
      }
    }
  }
  throw new Error(
    'Failed to get a response from the AI model after multiple retries.',
  );
};
