// utils/cvParser.js
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { CVDataPromptPilot as CVDataPrompt } from '../prompt/studentCVData.js';
import { genAIRequest as genAI } from '../config/gemini.js';

/**
 * Attempt to safely parse JSON, returning object or throwing descriptive Error.
 * This performs multiple tolerant passes to handle common AI-formatting problems.
 */
async function tolerantParseJSON(rawText) {
  const safeSlice = (s, n = 2000) =>
    typeof s === 'string'
      ? s.slice(0, n) + (s.length > n ? '…(truncated)' : '')
      : s;

  // 0) quick guard
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('No text returned from AI');
  }

  const original = rawText.trim();

  // 1) quick direct parse
  try {
    return JSON.parse(original);
  } catch (e) {
    // continue to tolerant parsing
  }

  // 2) remove code fences and common wrappers
  let cleaned = original
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  // 3) try to extract first {...} or [...] block
  const jsonBlockMatch =
    cleaned.match(/\{[\s\S]*\}$/) ||
    cleaned.match(/\{[\s\S]*?\}/) ||
    cleaned.match(/\[[\s\S]*\]/);
  if (jsonBlockMatch) {
    const candidate = jsonBlockMatch[0].trim();
    try {
      return JSON.parse(candidate);
    } catch (e) {
      cleaned = candidate; // proceed to repair candidate
    }
  }

  // 4) repair common issues, progressively
  // - remove trailing commas before } or ]
  let repaired = cleaned.replace(/,\s*(?=[}\]])/g, '');
  // - replace “smart quotes” with normal quotes
  repaired = repaired.replace(/[\u2018\u2019\u201C\u201D]/g, '"');
  // - attempt a conservative single-quote -> double-quote replacement for property values: 'value' -> "value"
  //   but avoid touching JSON that already looks valid. This is heuristic.
  repaired = repaired.replace(/'([^']*?)'/g, (_m, p1) => {
    // if p1 contains a double quote, skip (avoid breaking)
    if (p1.includes('"')) return `'${p1}'`;
    return `"${p1.replace(/"/g, '\\"')}"`;
  });
  // - remove any leading non-json garbage before first { or [
  const firstBrace = repaired.search(/[\{\[]/);
  if (firstBrace > 0) repaired = repaired.slice(firstBrace);
  // - remove any trailing non-json garbage after last } or ]
  const lastBraceIndex = Math.max(
    repaired.lastIndexOf('}'),
    repaired.lastIndexOf(']'),
  );
  if (lastBraceIndex > -1 && lastBraceIndex < repaired.length - 1) {
    repaired = repaired.slice(0, lastBraceIndex + 1);
  }
  // - collapse multiple newlines to single space to avoid accidental tokenization issues
  repaired = repaired.replace(/\r\n|\n|\r/g, ' ').trim();

  // 5) final parse attempts with multiple small tweaks
  const attempts = [
    repaired,
    // try wrapping top-level in object if starts with key-like content (rare)
    repaired.startsWith('"') ||
    repaired.startsWith('{') ||
    repaired.startsWith('[')
      ? null
      : `{${repaired}}`,
  ].filter(Boolean);

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch (e) {
      // swallow and continue
    }
  }

  // 6) if still not parsed, throw helpful error with snippets for debugging
  const err = new Error(
    'Invalid JSON received from AI. Parsing attempts failed. Raw and repaired snippets included.',
  );
  err.raw = safeSlice(original, 3000);
  err.repaired = safeSlice(repaired, 3000);
  throw err;
}

/**
 * Extracts and structures student data from a PDF CV
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Structured student data
 */
export const extractDataFromCV = async (filePath) => {
  try {
    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // Process text with AI (replace with your actual AI processing)
    // Slight reinforcement in prompt: ask for ONLY valid JSON (no markdown/explanations)
    const prompt = CVDataPrompt(pdfData.text);
    const rawText = await genAI(prompt, {
      userId: req.user?._id,
      endpoint: req.endpoint,
    });

    if (!rawText || typeof rawText !== 'string') {
      throw new Error('AI returned empty or non-string response');
    }

    let parsedJson;
    try {
      parsedJson = await tolerantParseJSON(rawText);
    } catch (parseErr) {
      // attach raw response for easier debugging upstream and rethrow
      console.error('CV Parsing Error: invalid JSON from AI', {
        message: parseErr.message,
        raw: parseErr.raw || rawText.slice(0, 2000),
        repaired: parseErr.repaired || undefined,
      });
      throw new Error('Invalid JSON received from AI');
    }

    // Standardize the extracted data
    return {
      personalInfo: {
        fullName: parsedJson.fullName || parsedJson.name || '',
        phone: parsedJson.phone || parsedJson.mobile || '',
        email: parsedJson.email || '',
      },
      education: (parsedJson.education || []).map((item) => ({
        educationId: uuidv4(),
        institute: item.institute || item.school || '',
        degree: item.degree || '',
        fieldOfStudy: item.fieldOfStudy || item.field || '',
        startYear: item.startYear || item.startDate || null,
        endYear: item.endYear || item.endDate || null,
        grade: item.grade || '',
        country: item.country || '',
        isCurrentlyStudying: !!item.isCurrentlyStudying,
      })),
      experience: (parsedJson.experience || []).map((item) => ({
        experienceId: uuidv4(),
        company: item.company || '',
        title: item.title || item.role || '',
        employmentType: item.employmentType || 'FULL_TIME',
        location: item.location || '',
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        description: item.description || '',
        experienceYrs:
          typeof item.experienceYrs === 'number'
            ? item.experienceYrs
            : item.experienceYrs
            ? Number(item.experienceYrs)
            : 0,
        currentlyWorking: !!item.currentlyWorking,
        technologies: item.technologies || [],
      })),
      skills: (parsedJson.skills || []).map((item) => {
        const skillObj =
          typeof item === 'string' ? { skill: item } : item || {};
        const level =
          (skillObj.level && String(skillObj.level).toUpperCase()) ||
          'BEGINNER';

        return {
          skillId: uuidv4(),
          skill: skillObj.skill || skillObj.name || '',
          level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(
            level,
          )
            ? level
            : 'BEGINNER',
        };
      }),
      projects: (parsedJson.projects || []).map((item) => ({
        projectName: item.projectName || item.name || '',
        description: item.description || '',
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        technologies: item.technologies || [],
        link: item.link || item.url || '',
        isWorkingActive: !!item.isWorkingActive,
      })),
      jobPreferences: parsedJson.jobPreferences || {},
    };
  } catch (error) {
    console.error('CV Parsing Error:', error);
    // bubble up a concise error (avoid leaking huge AI text in production logs)
    throw error;
  }
};
