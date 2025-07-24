import { GoogleGenerativeAI } from '@google/generative-ai';

const genAIKey = new GoogleGenerativeAI(
  'AIzaSyBV9zLT9YX8b7NVNbxM8YDgiRwsNANJRJs',
);

export async function genAI(prompt) {
  const model = genAIKey.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  const text = response.text();
  return text;
}
