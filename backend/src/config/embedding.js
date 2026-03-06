// src/config/embedding.js
import { FlagEmbedding, EmbeddingModel } from 'fastembed';
import crypto from 'crypto';

let model = null;

// Persistent Init: Prevents race conditions during multiple searches
async function getModel() {
  if (!model) {
    console.log('Downloading/Initializing local model (BGESmallENV15)...');
    model = await FlagEmbedding.init({
      model: EmbeddingModel.BGESmallENV15, // 384 dims, ~133MB (vs BGEBaseEN 768 dims, ~438MB)
    });
  }
  return model;
}

const embeddingCache = new Map();

export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string') return null;

    const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
    const cacheKey = crypto.createHash('md5').update(cleanText).digest('hex');

    if (embeddingCache.has(cacheKey)) return embeddingCache.get(cacheKey);

    const embeddingModel = await getModel();

    const rawEmbedding = await embeddingModel.queryEmbed(cleanText);
    const embedding = Array.from(rawEmbedding);

    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    console.error('Local Embedding Error:', error.message);
    // If you see zlib error again, your internet might be blocking the download
    return null;
  }
};
