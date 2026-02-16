// src/utils/embedding.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
// Initialize ONCE outside the function
const model = genAI.getGenerativeModel({ model: 'embedding-001' });

export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string') return null;

    const cleanText = text.replace(/\s+/g, ' ').trim().substring(0, 8000);

    // Reusing the 'model' instance
    const result = await model.embedContent(cleanText);

    if (result?.embedding?.values) {
      return result.embedding.values;
    }

    return null;
  } catch (error) {
    console.error('Gemini Embedding Error:', error.message);
    return null;
  }
};
