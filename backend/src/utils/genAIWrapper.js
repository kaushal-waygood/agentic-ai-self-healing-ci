// utils/genAIWrapper.js
import { genAI } from '../config/gemini.js';

export const callGenAI = async (prompt) => {
  const AI = genAI(prompt);

  try {
    const raw = await Promise.race([AI]);
    return raw;
  } catch (err) {
    if (err?.status === 503 || /Service Unavailable/i.test(err.message)) {
      const e = new Error('AI_SERVICE_UNAVAILABLE');
      e.code = 'AI_503';
      throw e;
    }
    if (err.message === 'AI_TIMEOUT') {
      const e = new Error('AI_TIMEOUT');
      e.code = 'AI_TIMEOUT';
      throw e;
    }
    throw err;
  }
};
