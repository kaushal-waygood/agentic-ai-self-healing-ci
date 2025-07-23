export function extractExperience(text) {
  if (!text) return null;

  const regexPatterns = [
    /(\d+)\+?\s*(?:years|yrs|year|yr)\s+(?:of\s+)?experience/i, // e.g. "3+ years of experience"
    /experience\s+of\s+(\d+)\s*(?:years|yrs|year|yr)/i, // e.g. "experience of 2 years"
    /minimum\s+of\s+(\d+)\s*(?:years|yrs|year|yr)/i, // e.g. "minimum of 4 years"
  ];

  for (const pattern of regexPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

export function extractQualifications(text) {
  if (!text) return [];

  const qualificationPatterns = [
    // Degrees (short & long form)
    /\b(b\.?com|m\.?com|b\.?sc|m\.?sc|b\.?a|m\.?a|b\.?ed|m\.?ed|b\.?fa|m\.?fa|b\.?tech|m\.?tech|b\.?e|m\.?e|bba|mba|bca|mca|llb|llm|mbbs|bds|bhms|bams|bpharm|mpharm|b\.?arch|m\.?arch)\b/gi,
    // Full forms (flexible matching)
    /\b(bachelor['’]?[s]?[\s\-]?(of\s+[\w\s]+)?)\b/gi,
    /\b(master['’]?[s]?[\s\-]?(of\s+[\w\s]+)?)\b/gi,
    /\b(post[\s\-]?graduate|under[\s\-]?graduate|associate['’]?[s]?\s+degree)\b/gi,
    /\b(high[\s\-]?school\s+diploma|10th\s+pass|12th\s+pass|ged)\b/gi,
    // Certifications / competitive exams
    /\b(ca|cs|cpa|cfa|icwa|bar\s+exam|ugc[\s\-]?net|neet|gate|gre|ielts|toefl|sat|act)\b/gi,
    // General terms
    /\b(diploma|certificate\s+course|pg[\s\-]?diploma)\b/gi,
  ];

  const found = new Set();
  const normalizedText = text.toLowerCase();

  for (const pattern of qualificationPatterns) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      matches.forEach((m) => found.add(m.trim()));
    }
  }

  return [...found];
}

export function extractQualificationsFromDescription(description) {
  if (!description) return [];

  const lines = description.split('\n');
  const qualifications = [];

  let inQualificationsSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Start when we find "Required Qualifications"
    if (/^required qualifications[:]?$/i.test(trimmedLine)) {
      inQualificationsSection = true;
      continue;
    }

    // Stop when we reach a new section
    if (inQualificationsSection && /^[A-Z][a-z]+.*[:]/.test(trimmedLine)) {
      break;
    }

    // Collect bullet points (starts with • or dash)
    if (inQualificationsSection && /^[•\-]/.test(trimmedLine)) {
      qualifications.push(trimmedLine.replace(/^[•\-]\s*/, ''));
    }
  }

  return qualifications;
}

export function extractResponsibilitiesFromDescription(description) {
  if (!description) return [];

  const lines = description.split('\n');
  const responsibilities = [];

  let inResponsibilities = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Look for the header
    if (/responsibilities (include|:)?$/i.test(trimmedLine)) {
      inResponsibilities = true;
      continue;
    }

    // Exit on reaching another section
    if (inResponsibilities && /^[A-Z][a-z]+.*[:]/.test(trimmedLine)) {
      break;
    }

    // Extract bullet points
    if (inResponsibilities && /^[•\-]/.test(trimmedLine)) {
      responsibilities.push(trimmedLine.replace(/^[•\-]\s*/, ''));
    }
  }

  return responsibilities;
}
