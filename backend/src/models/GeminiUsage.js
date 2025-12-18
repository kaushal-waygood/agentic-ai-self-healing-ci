// src/models/GeminiUsage.model.js
import mongoose from 'mongoose';

const geminiUsageSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },

    promptChars: { type: Number, required: true },

    promptTokens: { type: Number, required: true },
    outputTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },

    latencyMs: { type: Number, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId }, // optional
    endpoint: { type: String }, // optional

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const GeminiUsage = mongoose.model('GeminiUsage', geminiUsageSchema);
