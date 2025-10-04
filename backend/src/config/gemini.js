import { GoogleGenerativeAI } from '@google/generative-ai';

const genAIKey = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);

export async function genAI(prompt) {
  const model = genAIKey.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;

  const text = response.text();
  return text;
}
