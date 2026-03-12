import { Job } from '../models/jobs.model.js';
import { DeepSeekProvider } from '../llm/providers/deepseekProvider.js';
import { GeminiProvider } from '../llm/providers/geminiProvider.js';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function isValidEmail(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim().toLowerCase();
  return EMAIL_REGEX.test(trimmed) && trimmed.length <= 254;
}

function extractEmailFromResponse(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  if (lower === 'not_found' || lower === 'n/a' || lower === 'none') return null;
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

async function inferRecruitmentEmail(companyName, location, deepseek) {
  let locStr = 'unknown';
  if (location) {
    if (typeof location === 'string') {
      locStr = location.trim();
    } else if (typeof location === 'object') {
      locStr =
        [location.city, location.state, location.country]
          .filter(Boolean)
          .join(', ') || 'unknown';
    }
  }

  const prompt = `Given the company name and location below, infer the most likely HR/recruitment/careers contact email address.

Company: ${companyName}
Location: ${locStr}

Rules:
- Return ONLY a valid email address (e.g. hr@company.com, careers@company.com, recruitment@company.com)
- Use common patterns: hr, careers, jobs, recruitment, talent, hiring + @ + company domain
- If you cannot confidently infer a valid email, respond with exactly: NOT_FOUND
- Do not include any explanation, only the email or NOT_FOUND`;

  try {
    const res = await deepseek.generate(prompt, { temperature: 0.2 });
    const email = extractEmailFromResponse(res?.text);
    return isValidEmail(email) ? email : null;
  } catch (err) {
    console.error(
      `[EmailScrape] DeepSeek error for ${companyName}:`,
      err.message,
    );
    return null;
  }
}

export async function runEmailScrape(company, location) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not set');
  }

  const deepseek = new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
  });

  const email = await inferRecruitmentEmail(company, location, deepseek);
  return { email };
}
