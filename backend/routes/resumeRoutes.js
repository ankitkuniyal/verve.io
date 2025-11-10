import express from 'express';
const router = express.Router();

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
 * Simulates sending resume text to Gemini 2.5 Flash,
 * and expects a JSON response with a specific structure.
 * In production, replace with real Gemini API integration.
 *
 * The expected format is:
 * {
 *   strengths: [ ... ],
 *   improvements: [ ... ],
 *   grammar: [ ... ],
 *   formatting: [ ... ],
 *   missingSections: [ ... ],
 *   summary: 'string'
 * }
 */
async function analyzeResumeWithGemini(resumeText) {
  // Example: prompt to instruct Gemini to return strict JSON
  const instruction = `
    Analyze the following resume. Identify these items:
    - strengths (as an array of strings)
    - improvements (as an array of strings)
    - grammar issues (as an array of strings)
    - formatting suggestions (as an array of strings)
    - missing common resume sections (as an array of strings)
    - summary (short markdown string summary of the overall feedback)

    Return your response as a strict JSON object with this format:
    {
      "strengths": [ ... ],
      "improvements": [ ... ],
      "grammar": [ ... ],
      "formatting": [ ... ],
      "missingSections": [ ... ],
      "summary": "..."
    }

    Resume:
    ${resumeText}
  `;
  // -- SUBSTITUTE this with actual Gemini API integration --
  // The below is a stubbed response simulating the required JSON shape:
  return {
    strengths: [
      "Clear structure with logical section separation.",
      "Relevant experience in the target field.",
      "Concise summary at the top."
    ],
    improvements: [
      "Add more measurable achievements, such as quantified results.",
      "Tailor the summary for the specific job opening.",
      "Expand on leadership roles."
    ],
    grammar: [
      "Correct usage overall. Minor typo found in project section: 'achievment' → 'achievement'."
    ],
    formatting: [
      "Ensure consistent font usage throughout.",
      "Align bullet points for a neater appearance."
    ],
    missingSections: [
      "Education section was not found.",
      "Certifications are missing (if any)."
    ],
    summary: "### Feedback Summary\n- **Strengths:** Excellent structure and relevant experience.\n- **Improvements:** Add measurable results, double check for minor typos, and complete all standard sections."
  };
}

// POST /api/resume/analyze
router.post('/analyze', validateResumeInput, async (req, res) => {
  const { resume } = req.body;
  try {
    // Send resume to Gemini 2.5 Flash and get analysis in JSON format
    const analysisResult = await analyzeResumeWithGemini(resume);
    res.json({
      success: true,
      analysis: analysisResult
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume. Please try again later.'
    });
  }
});

export default router;
