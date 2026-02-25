import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1/embeddings',
  apiKey: 'sk-d15f8b26e743456ba46613f77fa0840c',
});

console.log(openai);

// Generate embedding for text
async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'deepseek-embedding',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw error;
  }
}

// Example usage
getEmbedding('Explain how LLMs generate human-like text.')
  .then((embedding) => console.log(embedding))
  .catch(console.error);
