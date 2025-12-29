import axios from 'axios';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { genAIRequest as genAI } from '../config/gemini.js';

const safeParse = (res) => JSON.parse(res.match(/\{[\s\S]*\}/)?.[0] || '{}');

const extractResumeText = async (url) => {
  const tryUrls = [
    url,
    url.replace('/upload/', '/upload/fl_attachment/'), // PDF forced download
    url.replace('/image/upload/', '/image/upload/fl_attachment/'), // Your config hack
  ];

  const extractPDFPrompt = `
    Return ONLY JSON:

    {
     "text": "<text>",
    }

    URL: ${JSON.stringify(url)}
    `;

  const raw = await genAI(extractPDFPrompt);
  const extractedText = safeParse(typeof raw === 'string' ? raw : raw?.text);

  console.log('extractedText', extractedText);

  let buffer;
  for (let link of tryUrls) {
    try {
      const { data } = await axios.get(link, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      buffer = data;
      break;
    } catch {}
  }

  if (!buffer) return '';

  // 1) Try text extraction
  const parsed = await pdfParse(buffer);

  console.log('parsed', parsed);
  if (parsed.text.trim().length > 20) return parsed.text;

  // 2) Fallback: OCR for image-type PDFs
  console.log('OCR fallback triggered...');
  const base64 = Buffer.from(buffer).toString('base64');
  const img = `data:application/pdf;base64,${base64}`;

  const ocr = await Tesseract.recognize(img, 'eng');
  return ocr.data.text || '';
};

export const calculateATSScore = async (
  jobDescription,
  resumeUrl,
  userId,
  endpoint,
) => {
  try {
    const resumeText = await extractResumeText(resumeUrl);

    if (!resumeText || resumeText.length < 50) {
      return {
        atsScore: 5,
        skillsMatched: [],
        skillsMissing: ['Resume content unreadable or scanned'],
        summary:
          'Resume could not be parsed properly. Upload a text-based PDF for better accuracy.',
      };
    }

    const prompt = `
Return ONLY JSON:

{
 "atsScore": <1-100>,
 "skillsMatched": [],
 "skillsMissing": [],
 "summary": "2-4 sentence ATS evaluation"
}

JobDescription: ${JSON.stringify(jobDescription.slice(0, 3000))}
ResumeText: ${JSON.stringify(resumeText.slice(0, 8000))}
`;

    const raw = await genAI(prompt, { userId, endpoint });
    const result = safeParse(typeof raw === 'string' ? raw : raw?.text);

    result.atsScore = Math.max(1, Math.min(result.atsScore || 1, 100));
    return result;
  } catch (err) {
    // console.error('ATS Score Error:', err);
    return {
      atsScore: 0,
      skillsMatched: [],
      skillsMissing: [],
      summary: 'ATS evaluation failed internally.',
      error: true,
    };
  }
};
