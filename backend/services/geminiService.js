import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠ GEMINI_API_KEY is not set. Gemini calls will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Call Gemini with question data and non-verbal metrics to get final results.
 *
 * @param {Array} questionsData - Array of:
 *   {
 *     index,
 *     questionId,
 *     question,
 *     transcript,
 *     visionSummary: {
 *       framesAnalyzed,
 *       framesWithFace,
 *       averageDetectionConfidence,
 *       joyScoreAverage,
 *       joyLikelihoodMode
 *     }
 *   }
 */
export async function generateInterviewResultsWithGemini(questionsData) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const systemPrompt = `
You are an expert MBA admissions interviewer and communication coach.
You will receive multiple interview questions, the candidate's transcripts,
and aggregated non-verbal metrics from video analysis using Google Vision.

Your task:
- Evaluate the candidate's performance.
- Return a STRICT JSON object ONLY (no extra text).
- The JSON MUST have the following exact structure and keys:

{
  "overallScore": number (0-100),
  "verbalCommunication": {
    "score": number,
    "feedback": [string, ...],
    "recommendations": [string, ...]
  },
  "confidence": {
    "score": number,
    "feedback": [string, ...],
    "recommendations": [string, ...]
  },
  "contentQuality": {
    "score": number,
    "feedback": [string, ...],
    "recommendations": [string, ...]
  },
  "nonVerbalCues": {
    "score": number,
    "feedback": [string, ...],
    "recommendations": [string, ...]
  },
  "keyStrengths": [string, ...],
  "areasForImprovement": [string, ...],
  "finalRecommendations": [string, ...]
}

Guidelines:
- Use transcripts for content and verbal communication.
- Use non-verbal metrics (framesWithFace, averageDetectionConfidence, joyScoreAverage, joyLikelihoodMode)
  to inform nonVerbalCues and confidence.
- Scores should usually be between 60 and 95 for average candidates, unless performance is extreme.
  `;

  const userPrompt = `
Here is the interview data:

${JSON.stringify(questionsData, null, 2)}

Now, provide the evaluation in the EXACT JSON structure described, with no extra commentary.
  `;

  const result = await model.generateContent([
    { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
  ]);

  const text = result.response.text().trim();

  // Attempt to parse JSON safely
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse Gemini JSON. Raw output:', text);
    throw new Error('Gemini returned invalid JSON');
  }

  return json;
}
