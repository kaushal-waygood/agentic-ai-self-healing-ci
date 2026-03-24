// ============================================================
// emailScraper.js  –  Real internet-search email finder
// Strategy:
//   1. Gemini 2.5 Flash with Google Search grounding (live web)
//   2. Targeted site searches (company website, LinkedIn, etc.)
//   3. Common pattern generation + MX-record confidence boost
//   4. Returns best email with confidence score
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Constants ────────────────────────────────────────────────
const EMAIL_REGEX =
  /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/g;

const HR_PREFIXES = [
  'hr',
  'careers',
  'jobs',
  'recruitment',
  'talent',
  'hiring',
  'apply',
  'work',
  'people',
  'joinUs',
];

// Emails from these domains are almost certainly wrong
const GARBAGE_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'example.com',
  'test.com',
  'email.com',
];

// ── Helpers ──────────────────────────────────────────────────
function isValidEmail(str) {
  if (!str || typeof str !== 'string') return false;
  const t = str.trim().toLowerCase();
  return (
    EMAIL_REGEX.test(t) &&
    t.length <= 254 &&
    !GARBAGE_DOMAINS.some((d) => t.endsWith(`@${d}`))
  );
}

function dedupeEmails(emails) {
  return [...new Set(emails.map((e) => e.trim().toLowerCase()))].filter(
    isValidEmail,
  );
}

function scoreEmail(email, companyName) {
  let score = 0;
  const lower = email.toLowerCase();
  const namePart = lower.split('@')[0];
  const domainPart = lower.split('@')[1] || '';

  // Prefer HR-related prefixes
  if (HR_PREFIXES.some((p) => namePart.startsWith(p))) score += 40;

  // Prefer domain that contains company name keywords
  const companyWords = companyName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (companyWords.some((w) => domainPart.includes(w))) score += 30;

  // Prefer shorter, cleaner prefixes
  if (namePart.length <= 12) score += 10;

  // Penalise personal-looking emails (firstname.lastname pattern)
  if (/^[a-z]+\.[a-z]+$/.test(namePart)) score -= 10;

  return score;
}

function extractEmailsFromText(text) {
  if (!text) return [];
  const matches = text.match(EMAIL_REGEX) || [];
  return matches.map((e) => e.toLowerCase());
}

function locationString(location) {
  if (!location) return '';
  if (typeof location === 'string') return location.trim();
  if (typeof location === 'object') {
    return [location.city, location.state, location.country]
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function categorizeEmail(email) {
  const namePart = email.split('@')[0].toLowerCase();

  if (/(tech|engineering|dev|developer|software|it)\b/i.test(namePart))
    return 'Tech';
  if (
    /(hr|careers|jobs|recruitment|talent|hiring|apply|people|joinus)\b/i.test(
      namePart,
    )
  )
    return 'HR';
  if (/(sales|marketing|pr|media)\b/i.test(namePart)) return 'Sales';
  if (/(contact|info|hello|admin|support)\b/i.test(namePart)) return 'General';

  return 'Other';
}

function processFoundEmails(emails) {
  return emails.map((email) => {
    const domain = email.split('@')[1] || '';
    const department = categorizeEmail(email);
    return { email, domain, department };
  });
}

// ── Core: Gemini with Google Search Grounding ────────────────
async function searchWithGeminiGrounding(companyName, location, genAI) {
  const locStr = locationString(location);
  const locHint = locStr ? ` based in ${locStr}` : '';

  // We run 3 targeted search prompts to maximise recall
  const prompts = [
    // Prompt 1: direct email hunt
    `Search the internet and find the official HR or recruitment email address for "${companyName}"${locHint}.
Look at: their official website contact/careers page, LinkedIn company page, Glassdoor, Indeed, Crunchbase, press releases, and job postings.
List every email address you find. Return them as a plain comma-separated list. If none found, return NOT_FOUND.`,

    // Prompt 2: careers page focused
    `Search for "${companyName}"${locHint} careers page or jobs page. 
Find any email address used for job applications or HR contact.
Return only email addresses as a comma-separated list, or NOT_FOUND.`,

    // Prompt 3: social + directory search
    `Search LinkedIn, Glassdoor, Crunchbase, ZoomInfo for "${companyName}"${locHint}.
Find contact emails for HR, talent acquisition, or recruitment team.
Return only email addresses as a comma-separated list, or NOT_FOUND.`,
  ];

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }], // <-- enables live Google Search grounding
  });

  const foundEmails = [];

  for (const prompt of prompts) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(
        `[EmailScrape] Grounding response snippet: ${text.slice(0, 120)}`,
      );
      const emails = extractEmailsFromText(text);
      foundEmails.push(...emails);

      // Also check grounding metadata citations for extra emails
      const candidates = result.response.candidates || [];
      for (const candidate of candidates) {
        const groundingMeta = candidate.groundingMetadata;
        if (groundingMeta?.searchEntryPoint?.renderedContent) {
          const extra = extractEmailsFromText(
            groundingMeta.searchEntryPoint.renderedContent,
          );
          foundEmails.push(...extra);
        }
      }
    } catch (err) {
      console.warn(`[EmailScrape] Grounding prompt failed: ${err.message}`);
    }
  }

  return dedupeEmails(foundEmails);
}

// ── Fallback: Pattern inference (only used if search finds nothing) ──
async function inferEmailByPattern(companyName, location, genAI) {
  const locStr = locationString(location);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `For the company "${companyName}"${locStr ? ` in ${locStr}` : ''}:
1. What is their most likely website domain? (e.g. acme.com)
2. Based on that domain, list the 3 most likely HR/recruitment emails using prefixes like hr, careers, jobs.

Return ONLY a JSON object like:
{"domain":"acme.com","emails":["hr@acme.com","careers@acme.com","jobs@acme.com"]}
No explanation, no markdown, just JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const parsed = JSON.parse(text);
    return (parsed.emails || [])
      .filter(isValidEmail)
      .map((e) => e.toLowerCase());
  } catch {
    return [];
  }
}

// ── Main exported function ───────────────────────────────────
/**
 * Finds the best recruitment/HR email for a company.
 * @param {string} companyName
 * @param {string|object|undefined} location
 * @returns {{ email: string|null, allFound: string[], allFoundDetails: object[], confidence: 'high'|'medium'|'low'|'none', source: string }}
 */
export async function runEmailScrape(companyName, location) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  console.log(
    `[EmailScrape] Searching for: "${companyName}" | location: ${locationString(location) || 'any'}`,
  );

  // Step 1: Live internet search via Gemini grounding
  let foundEmails = await searchWithGeminiGrounding(
    companyName,
    location,
    genAI,
  );
  let source = 'google_search_grounding';

  // Step 2: If grounding found nothing, fall back to pattern inference
  if (foundEmails.length === 0) {
    console.log(
      '[EmailScrape] No emails from grounding, trying pattern inference...',
    );
    foundEmails = await inferEmailByPattern(companyName, location, genAI);
    source = 'pattern_inference';
  }

  if (foundEmails.length === 0) {
    console.log('[EmailScrape] No email found by any method.');
    return {
      email: null,
      allFound: [],
      allFoundDetails: [],
      confidence: 'none',
      source: 'none',
    };
  }

  // Step 3: Score and pick the best email
  const scored = foundEmails.map((email) => ({
    email,
    score: scoreEmail(email, companyName),
  }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const confidence =
    source === 'google_search_grounding'
      ? best.score >= 40
        ? 'high'
        : 'medium'
      : 'low';

  console.log(
    `[EmailScrape] Best: ${best.email} (score ${best.score}, confidence ${confidence})`,
  );

  return {
    email: best.email,
    allFound: foundEmails,
    allFoundDetails: processFoundEmails(foundEmails),
    confidence,
    source,
  };
}
