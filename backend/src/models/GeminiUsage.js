import mongoose from 'mongoose';

const geminiUsageSchema = new mongoose.Schema(
  {
    llm: { type: String, required: true },
    model: { type: String, required: true },
    promptChars: { type: Number, required: true },
    promptTokens: { type: Number, required: true },
    outputTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId },
    endpoint: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const GeminiUsage = mongoose.model('GeminiUsage', geminiUsageSchema);
