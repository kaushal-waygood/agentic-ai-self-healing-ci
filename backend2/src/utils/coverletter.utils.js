// src/utils/coverletter.utils.js

/**
 * Very small heuristics for email/phone/name extraction.
 * Not perfect. Better than nothing.
 */

export const extractEmail = (text = '') => {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : '';
};

export const extractPhone = (text = '') => {
  // matches lots of possible phone formats, be permissive
  const m = text.match(
    /(\+?\d{1,3}[-.\s]?)?(\(?\d{3,4}\)?[-.\s]?)?[\d-.\s]{6,14}\d/,
  );
  return m ? m[0].trim() : '';
};

export const deduceNameFromText = (text = '') => {
  // naive heuristic: first non-empty line with alphabetic words and length 2..4 words
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    // ignore lines that look like emails or phones
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line)) continue;
    if (/\d/.test(line) && line.replace(/\D/g, '').length > 4) continue;
    // count words
    const words = line.split(/\s+/);
    if (
      words.length >= 1 &&
      words.length <= 4 &&
      /^[A-Za-z .'-]+$/.test(line)
    ) {
      return line;
    }
  }
  return '';
};
