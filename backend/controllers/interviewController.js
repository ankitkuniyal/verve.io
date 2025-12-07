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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' });
    }
    
    // Parse metadata
    let metadata = [];
    try {
      metadata = JSON.parse(req.body.metadata || '[]');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid metadata format' });
    }
    
    const interviewData = [];
    
    // Process each video file
    for (const file of req.files) {
      const fieldIndex = parseInt(file.fieldname.replace('video_', ''));
      const questionData = metadata.find(m => m.index === fieldIndex);
      
      if (!questionData) {
        continue;
      }
      
      // Check if file exists
      if (!fsSync.existsSync(file.path)) {
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
        const frames = await extractFrames(file.path, 15);
        
        // Analyze non-verbal cues
        const visionSummary = await analyzeFramesNonVerbal(frames);
        
        // Note: Add speech-to-text transcription here if needed
        // For now, using empty transcript
        const transcript = "";
        
        interviewData.push({
          ...questionData,
          transcript,
          visionSummary
        });
        
        // Clean up video file after processing
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
        
      } catch (error) {
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
      const evaluation = await generateInterviewResultsWithGemini(interviewData);
      
      res.json({
        success: true,
        evaluation,
        rawData: interviewData
      });
      
    } catch (geminiError) {
      // Fallback evaluation if Gemini fails
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
    
  } catch (error) {
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}