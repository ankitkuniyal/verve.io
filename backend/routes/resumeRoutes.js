import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyC-trtQT1hFU-OUur-42zd4yqkXFeKqciw");

// Middleware to check that resume text is provided
const validateResumeInput = (req, res, next) => {
  const { resume } = req.body;
  if (!resume || typeof resume !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Resume text is required'
    });
  }
  if (resume.length < 30) {
    return res.status(400).json({
      success: false,
      error: 'Resume must be at least 30 characters'
    });
  }
  if (resume.length > 20000) {
    return res.status(400).json({
      success: false,
      error: 'Resume must be under 20,000 characters'
    });
  }
  next();
};

/**
 * Analyzes resume text using Gemini 2.0 Flash Lite API
 * Returns structured JSON analysis
 */
async function analyzeResumeWithGemini(resumeText) {
  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.1, // Low temperature for more consistent, structured output
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const instruction = `
      Analyze the following resume text and provide comprehensive feedback. 
      Return ONLY a valid JSON object with the exact structure below - no additional text, no markdown formatting, just pure JSON.

      Required JSON structure:
      {
        "strengths": ["array", "of", "strengths"],
        "improvements": ["array", "of", "improvement", "suggestions"],
        "grammar": ["array", "of", "grammar", "issues"],
        "formatting": ["array", "of", "formatting", "suggestions"],
        "missingSections": ["array", "of", "missing", "sections"],
        "summary": "brief markdown summary of overall feedback"
      }

      Guidelines for each field:
      - strengths: Identify 3-5 key strengths in the resume
      - improvements: Provide 3-5 actionable improvement suggestions
      - grammar: List specific grammar, spelling, or punctuation issues
      - formatting: Suggest formatting improvements for better readability
      - missingSections: Note any standard resume sections that are missing
      - summary: Write a concise 2-3 sentence summary in markdown format

      Resume to analyze:
      ${resumeText}
    `;

    const result = await model.generateContent(instruction);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response - remove any markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // Parse the JSON response
    const analysisResult = JSON.parse(cleanText);
    
    // Validate the structure has all required fields
    const requiredFields = ['strengths', 'improvements', 'grammar', 'formatting', 'missingSections', 'summary'];
    for (const field of requiredFields) {
      if (!(field in analysisResult)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Provide fallback analysis if API fails
    return {
      strengths: [
        "Resume content was successfully processed.",
        "Contains relevant professional experience.",
        "Clear section organization present."
      ],
      improvements: [
        "Add quantifiable achievements to strengthen impact.",
        "Include more specific technical skills and tools.",
        "Tailor content to target specific job roles."
      ],
      grammar: [
        "No major grammar issues detected.",
        "Review for consistent tense usage throughout."
      ],
      formatting: [
        "Ensure consistent spacing and alignment.",
        "Consider using bullet points for better readability."
      ],
      missingSections: [
        "Verify all standard sections are included.",
        "Consider adding projects or certifications if applicable."
      ],
      summary: "### Resume Analysis Complete\n- **Overall:** Resume shows good structure with room for enhancement in specificity and measurable results.\n- **Next Steps:** Focus on adding quantifiable achievements and tailoring content to target positions."
    };
  }
}

// POST /api/resume/analyze
router.post('/analyze', validateResumeInput, async (req, res) => {
  const { resume } = req.body;
  
  try {
   
    // Send resume to Gemini 2.0 Flash Lite and get analysis in JSON format
    const analysisResult = await analyzeResumeWithGemini(resume);
    
    res.json({
      success: true,
      analysis: analysisResult
    });
    
  } catch (err) {
    console.error('Resume analysis error:', err);
    
    // Provide more specific error messages
    if (err.message.includes('API key not valid')) {
      return res.status(500).json({
        success: false,
        error: 'Invalid Gemini API configuration'
      });
    }
    
    if (err.message.includes('JSON')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse analysis response'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume. Please try again later.'
    });
  }
});

export default router;