// geminiInterviewResults.js
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
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

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
`.trim();

  const userPrompt = `
Here is the interview data (each item contains question, transcript, and non-verbal metrics):

${JSON.stringify(questionsData, null, 2)}

Now, provide the evaluation in the EXACT JSON structure described above, with no extra commentary, text, markdown, or code fences.
Return ONLY valid JSON.
`.trim();
  console.log("User prompt:", userPrompt);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt
  });

  let result;
  try {
    result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ]
    });
  } catch (err) {
    console.error('Error calling Gemini:', err);
    throw new Error('Gemini API call failed');
  }

  let text = (result.response?.text() || '').trim();

  // 🧼 Strip ```json ... ``` or ``` ... ``` if present
  if (text.startsWith('```')) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse Gemini JSON. Raw output:', text);
    throw new Error('Gemini returned invalid JSON');
  }

  return json;
}