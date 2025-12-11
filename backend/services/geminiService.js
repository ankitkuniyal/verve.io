import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let genAI;
let model;

try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
    generationConfig: {
      temperature: 0.2, // Slightly higher for creativity in questions, but still low for structured JSON
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    },
  });
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
}

// Helper to extract JSON if the model returns markdown
function extractStrictJSON(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response from model");
  }

  // Remove markdown code fences if present
  raw = raw.replace(/```json|```/gi, "").trim();

  // Extract first JSON block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found in model output");
  }

  const jsonString = raw.substring(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error("Model returned malformed JSON");
  }
}

/**
 * GENERATE INTERVIEW RESULTS (EXISTING FUNCTION - PRESERVED LOGIC)
 */
export async function generateInterviewResultsWithGemini(interviewData) {
  if (!model) throw new Error("AI service not available");
  
  console.debug('[GeminiService] Called generateInterviewResultsWithGemini');

  // Construct a prompt based on the interview data
  // logic...
     const systemPrompt = `You are an expert MBA admissions interviewer. Analyze the candidate's video responses based on the provided transcripts and vision analysis data.
     
     Output ONLY valid JSON matching this exact structure:
     {
       "overallScore": 85,
       "verbalCommunication": {
         "score": 80,
         "feedback": ["point 1", "point 2"],
         "recommendations": ["rec 1", "rec 2"]
       },
       "confidence": {
         "score": 75,
         "feedback": ["point 1"],
         "recommendations": ["rec 1"]
       },
       "contentQuality": {
         "score": 82,
         "feedback": ["point 1"],
         "recommendations": ["rec 1"]
       },
       "nonVerbalCues": {
         "score": 70,
         "feedback": ["based on vision data"],
         "recommendations": []
       },
       "keyStrengths": ["strength 1", "strength 2"],
       "areasForImprovement": ["improvement 1", "improvement 2"],
       "finalRecommendations": ["final rec 1", "final rec 2"]
     }
     
     If transcripts are missing or empty, do your best to evaluate based on the context or provide 0 in fields but MAINTAIN THE STRUCTURE. Do not change key names.`;
     const prompt = `Here is the interview data: ${JSON.stringify(interviewData)}`;
     console.debug('[GeminiService] Prompt:', prompt);

  try {
      const result = await model.generateContent([{ text: systemPrompt + "\n" + prompt }]);
      const text = result.response.text();
      console.debug('[GeminiService] Gemini response:', text);
      try {
        return JSON.parse(text);
      } catch (_) {
        return extractStrictJSON(text);
      }
  } catch (error) {
      console.error('[GeminiService] Error in generateInterviewResultsWithGemini:', error);
      throw error;
  }
}

/**
 * ANALYZE RESUME (Migrated from resumeRoutes.js)
 */
export async function analyzeResumeWithGemini(resumeText) {
  if (!model) throw new Error("AI service not available");

  try {
    // Redact PII (Simple redaction for safety)
    const safeResume = resumeText.substring(0, 15000)
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/(\+\d{1,3}[-.]?)?\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    const instruction = `
You are a resume analysis engine.
Return ONLY valid JSON.
JSON structure:
{
  "strengths": [],
  "improvements": [],
  "grammar": [],
  "formatting": [],
  "missingSections": [],
  "summary": "",
  "atsScore": 0,
  "keywordSuggestions": []
}

Analyze the following resume:
${safeResume}
`;

    const result = await model.generateContent([{ text: instruction }]);
    const text = result.response.text();
    
    try {
      return JSON.parse(text);
    } catch (_) {
      return extractStrictJSON(text);
    }
  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error);
    // Return fallback structure
    return {
      strengths: ["Resume processed (Fallback)"],
      improvements: ["Could not completely analyze due to AI error"],
      grammar: [],
      formatting: [],
      missingSections: [],
      summary: "Analysis failed temporarily.",
      atsScore: 50,
      keywordSuggestions: []
    };
  }
}

/**
 * GENERATE INTERVIEW QUESTIONS
 */
export async function generateInterviewQuestions(resumeText, formBuffer = {}, targetSchool = 'Business School') {
  if (!model) throw new Error("AI service not available");

  try {
     const safeResume = resumeText.substring(0, 10000);
     
     const prompt = `
     You are an expert MBA interviewer for top tier business schools like ${targetSchool}.
     User Resume:
     ${safeResume}
     
     User Background/Context:
     ${JSON.stringify(formBuffer)}
     
     Task: Generate 1 personalized interview questions.
     - Questions should be challenging and specific to the candidate's profile.
     - Include a mix of behavioral, situational, and profile-specific questions.
     - Output ONLY JSON.
     
     JSON Format:
     {
       "questions": [
         {
           "id": 1,
           "type": "Behavioral" | "Situational" | "Resume-Based",
           "text": "Question text here...",
           "context": "Why we are asking this (optional hint)"
         }
         ...
       ]
     }
     `;

    const result = await model.generateContent([{ text: prompt }]);
    const text = result.response.text();
    
    try {
      return JSON.parse(text);
    } catch (_) {
      return extractStrictJSON(text);
    }

  } catch (error) {
    console.error("Gemini Interview Gen Error:", error);
    // Fallback
    return {
      questions: [
        { id: 1, type: "General", text: "Tell me about yourself.", context: "Standard opener" },
        { id: 2, type: "Behavioral", text: "Why do you want to join this program?", context: "Motivation" },
        { id: 3, type: "Situational", text: "Describe a time you failed.", context: "Resilience" }
      ]
    };
  }
}