// controllers/interviewController.js
import path from 'path';
import { fileURLToPath } from 'url';
import { extractFrames } from '../utils/frameExtractor.js';
import { analyzeFramesNonVerbal } from '../services/visionService.js';
import { generateInterviewResultsWithGemini } from '../services/geminiService.js';
import fs from 'fs/promises';
import fsSync from 'fs';

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function analyzeInterview(req, res) {
  try {
    console.debug(`[analyzeInterview] Received interview analysis request. Files: ${(req.files || []).length}, Body keys:`, Object.keys(req.body || {}));
    if (!req.files || req.files.length === 0) {
      console.warn(`[analyzeInterview] No video files uploaded`);
      return res.status(400).json({ error: 'No video files uploaded' });
    }
    
    // Parse metadata
    let metadata = [];
    try {
      metadata = JSON.parse(req.body.metadata || '[]');
      console.debug(`[analyzeInterview] Parsed metadata:`, metadata);
    } catch (error) {
      console.error(`[analyzeInterview] Invalid metadata format:`, req.body.metadata, error);
      return res.status(400).json({ error: 'Invalid metadata format' });
    }
    
    const interviewData = [];
    
    // Process each video file
    for (const file of req.files) {
      console.debug(`[analyzeInterview] Processing file: fieldname="${file.fieldname}", filename="${file.filename}", path="${file.path}"`);
      const fieldIndex = parseInt(file.fieldname.replace('video_', ''));
      const questionData = metadata.find(m => m.index === fieldIndex);
      
      if (!questionData) {
        console.warn(`[analyzeInterview] No matching metadata for file "${file.fieldname}" (index ${fieldIndex}), skipping.`);
        continue;
      }
      
      // Check if file exists
      if (!fsSync.existsSync(file.path)) {
        console.error(`[analyzeInterview] File does not exist on disk: ${file.path}`);
        interviewData.push({
          ...questionData,
          transcript: "",
          visionSummary: {
            framesAnalyzed: 0,
            framesWithFace: 0,
            averageDetectionConfidence: 0,
            joyScoreAverage: 0,
            joyLikelihoodMode: 'UNKNOWN'
          }
        });
        continue;
      }
      
      try {
        // Extract frames
        console.debug(`[analyzeInterview] Extracting frames from: ${file.path}`);
        const frames = await extractFrames(file.path, 15);
        console.debug(`[analyzeInterview] Extracted ${frames.length} frames from "${file.filename}"`);
        
        // Analyze non-verbal cues
        console.debug(`[analyzeInterview] Analyzing non-verbal cues for "${file.filename}"...`);
        const visionSummary = await analyzeFramesNonVerbal(frames);
        console.debug(`[analyzeInterview] Vision summary for "${file.filename}":`, visionSummary);
        
        // Note: Client performs speech-to-text. We use that transcript.
        const transcript = questionData.transcript || "";
        console.debug(`[analyzeInterview] Using transcript length: ${transcript.length}`);
        
        interviewData.push({
          ...questionData,
          transcript,
          visionSummary
        });
        
        // Clean up video file after processing
        try {
          await fs.unlink(file.path);
          console.debug(`[analyzeInterview] Deleted video file after processing: "${file.filename}"`);
        } catch (cleanupError) {
          // Silent cleanup error but log for debug
          console.warn(`[analyzeInterview] Could not delete video file "${file.filename}":`, cleanupError);
        }
        
      } catch (error) {
        console.error(`[analyzeInterview] Error processing video "${file.filename}":`, error);
        interviewData.push({
          ...questionData,
          transcript: "",
          visionSummary: {
            framesAnalyzed: 0,
            framesWithFace: 0,
            averageDetectionConfidence: 0,
            joyScoreAverage: 0,
            joyLikelihoodMode: 'UNKNOWN'
          }
        });
      }
    }
    
    // Generate final evaluation
    try {
      console.debug(`[analyzeInterview] Generating interview evaluation with Gemini. Interview data count: ${interviewData.length}`);
      const evaluation = await generateInterviewResultsWithGemini(interviewData);

      console.debug(`[analyzeInterview] Gemini evaluation complete. Returning results.`);
      res.json({
        success: true,
        evaluation,
        rawData: interviewData
      });
      
    } catch (geminiError) {
      // Fallback evaluation if Gemini fails
      console.error(`[analyzeInterview] Gemini evaluation failed; using fallback. Error:`, geminiError);
      const fallbackEvaluation = {
        overallScore: interviewData.length > 0 ? 65 : 0,
        verbalCommunication: {
          score: 65,
          feedback: ["Basic analysis complete. For detailed evaluation, API quota exceeded."],
          recommendations: ["Try again later or upgrade your API plan."]
        },
        confidence: {
          score: 60,
          feedback: ["Non-verbal analysis limited due to API constraints."],
          recommendations: ["Ensure good lighting and eye contact."]
        },
        keyStrengths: ["Video processing completed successfully."],
        areasForImprovement: ["API quota exceeded. Try again in 48 hours."]
      };
      
      res.json({
        success: true,
        evaluation: fallbackEvaluation,
        rawData: interviewData,
        note: "Used fallback evaluation due to API limits"
      });
    }
    
    // ... (existing catch block)
  } catch (error) {
    console.error(`[analyzeInterview] Fatal error in handler:`, error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}

/**
 * Generate Interview Questions
 * POST /api/services/interview/generate
 */
import { userModel } from '../models/userModel.js';
import { interviewModel } from '../models/interviewModel.js';
import { generateInterviewQuestions } from '../services/geminiService.js';

export async function generateQuestions(req, res) {
  try {
    const { resumeText, targetSchool, exam, domain, experienceLevel } = req.body;
    const userId = req.user.uid;
    // const userCredits = req.userCredits; // Deprecated: we check atomically below but can still use for initial generic check if desired.

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }
    
    // 1. Generate Questions
    console.debug(`[generateQuestions] Generating for user ${userId}, School: ${targetSchool}`);
    
    // Context buffer
    const context = {
      targetSchool,
      exam: exam || "MBA Entrance",
      domain: domain || "General Management",
      experienceLevel: experienceLevel || "N/A"
    };

    const questionsData = await generateInterviewQuestions(resumeText, context, targetSchool);
    
    // 2. Decrement Credits (Atomic Transaction via Model)
    let remainingCredits;
    try {
        remainingCredits = await userModel.deductCredit(userId);
    } catch (txError) {
        if (txError.message === "Insufficient credits") {
            return res.status(403).json({ error: "Insufficient credits", requiresSubscription: true });
        }
        throw txError;
    }

    // 3. Save Interview Session (via Model)
    try {
        await interviewModel.createInterview({
            userId,
            targetSchool,
            questions: questionsData.questions,
            status: 'generated',
            resumeSnapshot: resumeText.substring(0, 500) + "..."
        });
    } catch (saveError) {
        console.warn("Failed to save interview history:", saveError);
    }

    // 4. Return
    res.json({
      success: true,
      data: questionsData,
      remainingCredits: remainingCredits
    });

  } catch (error) {
    console.error("[generateQuestions] Error:", error);
    res.status(500).json({ error: "Failed to generate interview questions" });
  }
}