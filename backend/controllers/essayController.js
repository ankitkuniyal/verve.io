import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { admin,db } from '../config/firebase.js';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analysisPrompt = `
You are an expert MBA admissions evaluator. Analyze the following essay comprehensively and provide a detailed JSON response with this exact structure:

{
  "overallAssessment": {
    "totalScore": 0-100,
    "grade": "A-F",
    "summary": "brief overall assessment"
  },
  "sectionScores": {
    "content": 0-10,
    "structure": 0-10,
    "language": 0-10,
    "impact": 0-10
  },
  "languageAnalysis": {
    "spellingErrors": [{ "word": "misspelled", "suggestion": "correct", "context": "sentence" }],
    "grammarErrors": [{ "issue": "description", "suggestion": "correction", "context": "sentence" }],
    "vocabularyLevel": "assessment",
    "sentenceStructure": "assessment"
  },
  "contentAnalysis": {
    "thesisClarity": "assessment",
    "argumentDevelopment": "assessment",
    "evidenceUsage": "assessment",
    "originality": "assessment",
    "topicRelevance": "assessment"
  },
  "structureAnalysis": {
    "introduction": { "score": 0-10, "feedback": "comments" },
    "body": { "score": 0-10, "feedback": "comments" },
    "conclusion": { "score": 0-10, "feedback": "comments" },
    "flow": "assessment"
  },
  "improvementRecommendations": {
    "critical": ["urgent fixes"],
    "important": ["significant improvements"],
    "suggested": ["optional enhancements"]
  },
  "positiveAspects": ["list of strengths"],
  "wordCount": 0,
  "estimatedReadingTime": "X minutes",
  "readabilityMetrics": {
    "level": "assessment",
    "complexity": "simple/moderate/complex"
  }
}

ESSAY TO ANALYZE:
"{essay}"

TOPIC: "{topic}"

Provide ONLY the JSON response, no additional text or explanations.
`;

// Helper: Tries first with 'gemini-2.0-flash-lite', then falls back to 'gemini-2.5-flash'
async function tryAnalyzeWithModels(finalPrompt) {
  const modelNames = ['gemini-2.0-flash-lite', 'gemini-2.5-flash'];
  let lastError = null;
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanText);
      return analysis;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export const analyzeEssay = async (req, res) => {
  try {
    const { essay, topic = 'Essay' } = req.body;

    // Expect req.user (populated by authMiddleware) for user id
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required to analyze and store essay results'
      });
    }

    if (!essay) {
      return res.status(400).json({
        success: false,
        error: 'Essay text is required'
      });
    }

    if (essay.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Essay must be at least 50 characters long'
      });
    }

    const finalPrompt = analysisPrompt
      .replace('{essay}', essay)
      .replace('{topic}', topic);

    let analysis;
    try {
      analysis = await tryAnalyzeWithModels(finalPrompt);
    } catch (err) {
      throw err;
    }

    // Store the analysis in the Firebase structure: essay > userId > [array of analysis]
    try {
      const assessedAt = new Date();

      // Reference: top-level collection 'essay' > document (userId) > 'analyses' (array field)
      const userDocRef = db.collection('essay').doc(userId);

      // Data to append to the analyses array
      const dataToStore = {
        topic: topic,
        overallAssessment: analysis.overallAssessment || null,
        sectionScores: analysis.sectionScores || null,
        analyzedAt: assessedAt.toISOString(),
        essayLength: essay.length,
        wordCount: essay.split(/\s+/).length
      };

      // Use Firestore's arrayUnion to append to the analyses array
      await userDocRef.set(
        {
          analyses: admin.firestore.FieldValue.arrayUnion(dataToStore)
        },
        { merge: true }
      );
    } catch (firebaseErr) {
      console.error('Failed to store analysis in Firebase:', firebaseErr);
      // Proceed anyway. Do NOT block API, but add warning field to response if needed.
    }

    res.json({
      success: true,
      data: {
        analysis,
        metadata: {
          topic,
          analyzedAt: new Date().toISOString(),
          essayLength: essay.length,
          wordCount: essay.split(/\s+/).length
        }
      }
    });

  } catch (error) {
    console.error('Essay analysis error:', error);

    // Handle specific error types
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse analysis response',
        details: 'The analysis service returned an invalid format'
      });
    }

    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        details: 'API service is not properly configured'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze essay',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getAnalysisHealth = async (req, res) => {
  try {
    // Test the Gemini API connection
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const testPrompt = 'Respond with just: "OK"';

    let text = '';
    try {
      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      text = response.text();
    } catch (err) {
      // fallback to gemini-2.5-flash if connection fails
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result2 = await fallbackModel.generateContent(testPrompt);
        const response2 = await result2.response;
        text = response2.text();
      } catch (e) {
        return res.status(500).json({
          success: false,
          status: 'Service degraded',
          error: e.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      status: 'Service is operational',
      geminiStatus: text.trim() === 'OK' ? 'connected' : 'unexpected_response',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Service degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};