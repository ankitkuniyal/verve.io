import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractFrames } from '../utils/frameExtractor.js';
import { analyzeFramesNonVerbal } from '../services/visionService.js';
import { generateInterviewResultsWithGemini } from '../services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_DIR = path.join(__dirname, '../../tmp');
const FRAMES_PER_QUESTION = 15;

async function ensureTmpDir() {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function analyzeInterview(req, res) {
  await ensureTmpDir();

  const files = req.files || [];

  try {
    // 1. Parse metadata
    const rawMetadata = req.body.metadata;
    if (!rawMetadata) {
      return res.status(400).json({ error: 'metadata field is required' });
    }

    let metadata;
    try {
      metadata = JSON.parse(rawMetadata);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid metadata JSON' });
    }

    if (!Array.isArray(metadata) || !metadata.length) {
      return res.status(400).json({ error: 'metadata must be a non-empty array' });
    }

    // 2. Map files by fieldname (video_0, video_1, ...)
    const fileMap = {};
    for (const f of files) {
      fileMap[f.fieldname] = f;
    }

    // 3. For each question, extract frames, run Vision, prepare data for Gemini
    const questionsData = [];

    for (const meta of metadata) {
      const { index, questionId, question, transcript = '' } = meta;
      const fieldName = `video_${index}`;
      const file = fileMap[fieldName];

      let visionSummary = {
        framesAnalyzed: 0,
        framesWithFace: 0,
        averageDetectionConfidence: 0,
        joyScoreAverage: 0,
        joyLikelihoodMode: 'UNKNOWN'
      };

      if (file) {
        try {
          const frameBuffers = await extractFrames(file.path, FRAMES_PER_QUESTION, TMP_DIR);
          visionSummary = await analyzeFramesNonVerbal(frameBuffers);
        } catch (err) {
          console.error(`Error processing video for question index ${index}:`, err.message);
        }
      } else {
        console.warn(`No video file found for index ${index} (expected field ${fieldName})`);
      }

      questionsData.push({
        index,
        questionId,
        question,
        transcript,
        visionSummary
      });
    }

    // 4. Call Gemini to generate final interview results
    let results;
    try {
      results = await generateInterviewResultsWithGemini(questionsData);
    } catch (err) {
      console.error('Error calling Gemini:', err.message);
      return res.status(500).json({
        error: 'Failed to generate interview results from Gemini'
      });
    }

    // 5. Return results to frontend
    return res.json(results);
  } catch (err) {
    console.error('❌ Error in analyzeInterview controller:', err);
    return res.status(500).json({
      error: 'Internal server error while analyzing interview'
    });
  } finally {
    // Cleanup uploaded videos
    for (const f of files) {
      if (f.path) {
        fs.unlink(f.path).catch(() => {});
      }
    }
  }
}
