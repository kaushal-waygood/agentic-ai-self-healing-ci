import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAIKey = new GoogleGenerativeAI(config.geminiAPI);

export async function genAI(prompt) {
  const model = genAIKey.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;

  const text = response.text();
  return text;
}
