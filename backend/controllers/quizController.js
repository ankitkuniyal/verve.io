import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Clean JSON string by removing problematic characters, including bad escapes
 */
function cleanJsonString(jsonString) {
  return jsonString
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\u2028/g, '')
    .replace(/\u2029/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    // Remove single (or stray) backslashes NOT followed by valid escape characters
    .replace(/\\(?!["\\/bfnrtu])/g, "")
    // Remove non printable unicode escape sequences
    .replace(/\\u[0-9a-fA-F]{0,3}([^0-9a-fA-F])/g, "$1")
    .trim();
}

/**
 * Extract and parse JSON from AI response (robust to bad escapes)
 */
function parseAIResponse(text) {
  try {
    // Extract the JSON block from the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonString = jsonMatch[0];
    jsonString = cleanJsonString(jsonString);

    // Try to parse and recover from common \ issues that cause JSON.parse to fail
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // Try to fix problematic escaped quotes and other broken escapes
      let safeJSONString = jsonString
        .replace(/\\'/g, "'")
        .replace(/\\([^"\\/bfnrtu])/g, '$1') // remove bad backslashes
        .replace(/\\"/g, '"');
      return JSON.parse(safeJSONString);
    }
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    console.error('Original text:', text.slice(0, 1000)); // print only first KB for debugging
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}

/**
 * Helper to try quiz generation using multiple models
 */
async function tryGenerateQuizWithModels(prompt, modelNames) {
  let lastError = null;
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Trying Gemini model: ${modelName}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`[${modelName}] Raw AI response received`);
      console.log(`[${modelName}] Response length:`, text.length);
      console.log(`[${modelName}] First 500 chars:`, text.substring(0, 500));
      let quizData;
      try {
        quizData = parseAIResponse(text);
      } catch (parseError) {
        // Attempt last-resort: remove all backslashes and try again for severe cases
        try {
          const fixed = text.replace(/\\/g, "");
          quizData = JSON.parse(fixed.match(/\{[\s\S]*\}/)[0]);
        } catch {
          throw parseError;
        }
      }
      // Validate the quiz structure
      if (!quizData.sections || !Array.isArray(quizData.sections)) {
        throw new Error('Invalid quiz structure: missing sections array');
      }
      for (const section of quizData.sections) {
        if (!section.questions || !Array.isArray(section.questions)) {
          throw new Error(`Invalid section structure: ${section.name} missing questions array`);
        }
      }
      // If all checks pass, return quizData!
      return quizData;
    } catch (error) {
      lastError = error;
      console.warn(`[${modelName}] Quiz generation failed, trying next model...: ${error.message}`);
      continue;
    }
  }
  // If we got here, all attempts failed.
  throw lastError || new Error('All AI models failed to generate quiz');
}

/**
 * Generate AI Quiz using Gemini. Tries with gemini-2.0-flash-lite first; if fails, falls back to gemini-2.5-flash.
 */
export const generateQuiz = async (req, res) => {
  try {
    const { examType, examConfig, preferences } = req.body;

    if (!examType || !examConfig || !preferences) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: examType, examConfig, preferences"
      });
    }

    if (!examConfig.name || !examConfig.duration || !examConfig.sections || !examConfig.questionTypes) {
      return res.status(400).json({
        success: false,
        error: "Invalid examConfig structure"
      });
    }

    const sections = Array.isArray(examConfig.sections) ? examConfig.sections : [];
    const questionTypes = Array.isArray(examConfig.questionTypes) ? examConfig.questionTypes : ['MCQ'];
    if (sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one section is required"
      });
    }

    const prompt = `
You are an expert MBA exam preparation specialist. Generate a realistic ${examConfig.name} practice quiz.

EXAM DETAILS:
- Name: ${examConfig.name}
- Duration: ${examConfig.duration} minutes
- Sections: ${sections.join(', ')}
- Question Types: ${questionTypes.join(', ')}

QUIZ REQUIREMENTS:
- Total Questions: ${preferences.questionCount || 10}
- Difficulty: ${preferences.difficulty || 'mixed'}
- Focus Areas: ${preferences.focusAreas && preferences.focusAreas.length > 0 ? preferences.focusAreas.join(', ') : 'All sections'}

INSTRUCTIONS:
1. Create exactly ${preferences.questionCount || 1} questions
2. Distribute questions across sections
3. Each question must have 4 options (A, B, C, D)
4. Provide clear explanations
5. Include realistic time estimates

OUTPUT FORMAT - RETURN ONLY VALID JSON, NO OTHER TEXT:

{
  "title": "AI-Generated ${examConfig.name} Practice Test",
  "duration": ${examConfig.duration},
  "sections": [
    {
      "name": "Section Name",
      "duration": ${Math.floor(examConfig.duration / sections.length)},
      "instructions": "Section instructions here",
      "questions": [
        {
          "id": 1,
          "section": "Section Name",
          "type": "MCQ",
          "text": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Explanation here",
          "difficulty": "easy",
          "topic": "Topic name",
          "timeEstimate": 120
        }
      ]
    }
  ],
  "totalQuestions": ${preferences.questionCount || 10},
  "passingScore": 70
}

IMPORTANT: Return ONLY the JSON object. Do not include any other text, markdown, or code blocks.
`;

    // Try gemini-2.0-flash-lite first, then fallback to gemini-2.5-flash on error
    let quizData;
    try {
      quizData = await tryGenerateQuizWithModels(prompt, ['gemini-2.0-flash-lite', 'gemini-2.5-flash']);
    } catch (error) {
      console.error('Quiz generation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate quiz',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    console.log('Quiz generated successfully');
    res.json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: quizData
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Helper to try quiz performance analysis using multiple models
 */
async function tryAnalyzeQuizPerformanceWithModels(analysisPrompt, modelNames) {
  let lastError = null;
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Trying Gemini model for analysis: ${modelName}`);
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text();
      console.log(`[${modelName}] Raw analysis response received`);
      console.log(`[${modelName}] Response length:`, text.length);
      let analysisData;
      try {
        analysisData = parseAIResponse(text);
      } catch (parseError) {
        // Last-resort clean: remove backslashes, re-parse
        try {
          const fixed = text.replace(/\\/g, "");
          analysisData = JSON.parse(fixed.match(/\{[\s\S]*\}/)[0]);
        } catch {
          throw parseError;
        }
      }
      // Validate analysis structure
      if (!analysisData.analysis) {
        throw new Error('Invalid analysis structure from AI');
      }
      return analysisData;
    } catch (error) {
      lastError = error;
      console.warn(`[${modelName}] Quiz analysis failed, trying next model...: ${error.message}`);
      continue;
    }
  }
  // If we got here, all attempts failed.
  throw lastError || new Error('All AI models failed to analyze performance');
}

/**
 * Analyze user's quiz performance using Gemini AI, first attempts gemini-2.0-flash-lite, then falls back to gemini-2.5-flash if needed.
 */
export const analyzeQuizPerformance = async (req, res) => {
  try {
    const { quizData, userAnswers, timeTaken, examType } = req.body;

    if (!quizData || !userAnswers || typeof timeTaken === 'undefined' || !examType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: quizData, userAnswers, timeTaken, examType"
      });
    }

    const totalQuestions = quizData.totalQuestions || quizData.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
    const answeredQuestions = userAnswers.filter(answer => answer !== null && answer !== undefined).length;

    const analysisPrompt = `
Analyze this quiz performance and return ONLY JSON.

TEST DATA:
- Exam: ${examType}
- Total Questions: ${totalQuestions}
- Answered: ${answeredQuestions}
- Time: ${timeTaken} seconds

QUIZ: ${JSON.stringify(quizData, null, 2)}
ANSWERS: ${JSON.stringify(userAnswers)}

RETURN ONLY THIS JSON FORMAT, NO OTHER TEXT:
THIS IS A SAMPLE OUTPUT, YOU REPLY AS PER THE USER PERFORMANCE
{
  "success": true,
  "message": "Performance analyzed successfully",
  "analysis": {
    "overallScore": ,
    "correctAnswers": ,
    "totalQuestions": ,
    "timeTaken": ,
    "examType": "${examType}",
    "questionsAppeared": [
      {
        "questionId": 1,
        "questionText": "Sample question 1?",
        "section": "Quantitative",
        "userAnswer": "A",
        "correctAnswer": "B"
      },
      {
        "questionId": 2,
        "questionText": "Sample question 2?",
        "section": "Verbal",
        "userAnswer": "True",
        "correctAnswer": "False"
      }
      // ... add each question, its section, and answers
    ],
    "analysis": {
      "sectionScores": {
        "Quantitative": 80,
        "Verbal": 90
      },
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "timeAnalysis": {
        "timePerQuestion": 120,
        "efficiencyScore": 85,
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      },
      "improvementPlan": {
        "immediateActions": ["Action 1", "Action 2"],
        "longTermStrategies": ["Strategy 1", "Strategy 2"],
        "recommendedResources": ["Resource 1", "Resource 2"]
      },
      "comparativeAnalysis": {
        "percentile": 85,
        "benchmark": "Above average"
      },
      "personalizedFeedback": "Your personalized feedback here."
    }
  }
}
`;

    // Try gemini-2.0-flash-lite first, fallback to gemini-2.5-flash
    let analysisData;
    try {
      analysisData = await tryAnalyzeQuizPerformanceWithModels(analysisPrompt, ['gemini-2.0-flash-lite', 'gemini-2.5-flash']);
    } catch (error) {
      console.error('Quiz analysis error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze performance',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    console.log('Analysis completed successfully');
    res.json(analysisData);

  } catch (error) {
    console.error('Quiz analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};