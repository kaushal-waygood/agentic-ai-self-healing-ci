// src/utils/embedding.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';

// Ensure process.env.GEMINI_API_KEY is set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export const generateEmbedding = async (text) => {
  try {
    if (!text) return null;

    // Clean text
    const cleanText = text.replace(/\n/g, ' ').substring(0, 9000);

    const result = await model.embedContent(cleanText);
    const embedding = result.embedding;

    // Return the array of numbers
    return embedding.values;
  } catch (error) {
    console.error('Error generating Gemini embedding:', error.message);
    return null;
  }
};
