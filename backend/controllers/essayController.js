import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyC-trtQT1hFU-OUur-42zd4yqkXFeKqciw");


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

export const analyzeEssay = async (req, res) => {
  try {
    const { essay, topic = 'General MBA Admission' } = req.body;

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const finalPrompt = analysisPrompt
      .replace('{essay}', essay)
      .replace('{topic}', topic);

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanText);

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
    if (error.message.includes('JSON')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse analysis response',
        details: 'The analysis service returned an invalid format'
      });
    }

    if (error.message.includes('API key')) {
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

export const bulkAnalyzeEssays = async (req, res) => {
  try {
    const { essays } = req.body;

    if (!Array.isArray(essays) || essays.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Essays array is required and cannot be empty'
      });
    }

    // Limit bulk analysis to 5 essays at a time
    if (essays.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Bulk analysis limited to 5 essays at a time'
      });
    }

    const analysisResults = [];

    for (const essayData of essays) {
      const { essay, topic = 'General MBA Admission', candidateId } = essayData;

      if (!essay) {
        analysisResults.push({
          success: false,
          candidateId,
          error: 'Essay text is required'
        });
        continue;
      }

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const finalPrompt = analysisPrompt
          .replace('{essay}', essay)
          .replace('{topic}', topic);

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        analysisResults.push({
          success: true,
          candidateId,
          analysis,
          metadata: {
            topic,
            analyzedAt: new Date().toISOString(),
            wordCount: essay.split(/\s+/).length
          }
        });
      } catch (error) {
        analysisResults.push({
          success: false,
          candidateId,
          error: `Analysis failed: ${error.message}`
        });
      }
    }

    res.json({
      success: true,
      data: {
        results: analysisResults,
        summary: {
          total: essays.length,
          successful: analysisResults.filter(r => r.success).length,
          failed: analysisResults.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Bulk analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk analysis',
      details: error.message
    });
  }
};

export const getAnalysisHealth = async (req, res) => {
  try {
    // Test the Gemini API connection
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const testPrompt = 'Respond with just: "OK"';
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

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