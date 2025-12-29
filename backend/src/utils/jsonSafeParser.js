// utils/jsonSafeParser.js
// A tolerant JSON extractor that survives messy LLM output

/**
 * Safely attempts to extract JSON from unpredictable AI responses.
 * Handles:
 *  - ```json fences
 *  - trailing commas
 *  - text before/after JSON
 *  - HTML/Markdown contamination
 *  - invalid characters
 */

export async function tolerantParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string')
    throw new Error('Invalid input: expected string JSON response');

  let cleaned = rawText.trim();

  // Remove code fences
  cleaned = cleaned.replace(/```json|```/gi, '').trim();

  // Try direct parse first (fast path)
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Isolate JSON block { .... } or [ ... ]
  const match = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);

  if (!match) throw new Error('No JSON structure detected');

  cleaned = match[0];

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // Fix smart quotes
  cleaned = cleaned.replace(/[\u2018\u2019\u201C\u201D]/g, '"');

  // Remove non-JSON leading garbage
  const first = cleaned.search(/[\{\[]/);
  if (first > 0) cleaned = cleaned.slice(first);

  // Remove trailing junk
  const last = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (last > -1) cleaned = cleaned.slice(0, last + 1);

  // Attempt parse again
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse AI JSON response');
  }
}
