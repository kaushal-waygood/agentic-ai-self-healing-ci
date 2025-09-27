import { genAI } from '../config/gemini.js';

export const calculateJobMatch = async (job, student) => {
  // rawResponse is declared here to be accessible in the catch block
  let rawResponse = '';

  const prompt = `
    You are an expert career counselor AI. Your primary goal is to encourage and empower students by showing them how their skills can fit a job description.

    Analyze the provided Job and Student JSON data. Based on your analysis, return a single, valid JSON object with NO additional text or explanations outside of the JSON structure.

    ---
    **Scoring Philosophy (IMPORTANT):**
    - Your tone must be encouraging and optimistic.
    - Score leniently. Your goal is to highlight potential, not disqualify candidates.
    - A score of 5-6 indicates a potential match with room to grow. A score of 7-8 is a strong match.
    - Reserve very low scores (1-3) ONLY for a complete mismatch of fundamental career paths (e.g., a chef applying for a software engineering role).
    - Focus on transferable skills and the student's potential for growth when calculating the score.
    ---

    The JSON object MUST have this exact structure:
    {
      "matchScore": <an integer between 1 and 10>,
      "recommendation": "<A concise, single-paragraph explanation for the score. Start by highlighting the student's key strengths and potential, then suggest areas for improvement in a constructive way.>"
    }

    Example Response:
    {
      "matchScore": 7,
      "recommendation": "You're a promising candidate for this role! Your hands-on experience with React is a great asset and directly aligns with the job's core needs. To become an even more competitive applicant, focusing on building a project that uses TypeScript would be an excellent next step."
    }

    ---
    Job Data:
    ${JSON.stringify(job)}

    Student Data:
    ${JSON.stringify(student)}
  `;

  try {
    rawResponse = await genAI(prompt);

    const match = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = match ? match[1] : rawResponse;

    const parsedResponse = JSON.parse(jsonString);

    // Ensure score is within the 1-10 range
    if (parsedResponse.matchScore > 10) parsedResponse.matchScore = 10;
    if (parsedResponse.matchScore < 1) parsedResponse.matchScore = 1;

    return parsedResponse;
  } catch (error) {
    console.error('Error calculating job match:', error);
    // This now logs the response that failed without making another API call.
    console.error('Raw AI Response that failed parsing:', rawResponse);

    return {
      matchScore: 0, // Using 0 to signify an error, as it's outside the 1-10 range
      recommendation:
        'An error occurred while calculating the match score. Please try again.',
      error: 'Failed to process AI response.',
    };
  }
};
