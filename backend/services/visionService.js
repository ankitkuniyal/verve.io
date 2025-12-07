// visionAnalysis.js
import vision from '@google-cloud/vision';
import { fileURLToPath } from 'url';
import path from 'path';

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Vision client only if GOOGLE_CREDENTIALS_JSON is present
let client = null;

if (process.env.GOOGLE_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  client = new vision.ImageAnnotatorClient({
    credentials,
    projectId: process.env.GOOGLE_CLOUD_PROJECT
  });
  console.log('✅ Vision client initialized with JSON from env');
}

function likelihoodToScore(likelihood) {
  switch (likelihood) {
    case 'VERY_UNLIKELY': return 0;
    case 'UNLIKELY': return 1;
    case 'POSSIBLE': return 2;
    case 'LIKELY': return 3;
    case 'VERY_LIKELY': return 4;
    default: return 2;
  }
}

async function analyzeFaceFromBuffer(imageBuffer) {
  try {
    console.debug('[VisionService] Analyzing face from buffer of length:', imageBuffer?.length);
    const [result] = await client.faceDetection({
      image: { content: imageBuffer }
    });
    
    const faces = result.faceAnnotations || [];
    console.debug(`[VisionService] Detected ${faces.length} face(s)`);
    if (!faces.length) return null;
    
    const face = faces[0];
    console.debug('[VisionService] Face results:', {
      detectionConfidence: face.detectionConfidence,
      joyLikelihood: face.joyLikelihood
    });
    return {
      detectionConfidence: face.detectionConfidence || 0,
      joyLikelihood: face.joyLikelihood || 'UNKNOWN'
    };
  } catch (error) {
    console.error('Vision API error:', error.message);
    return null;
  }
}

export async function analyzeFramesNonVerbal(frameBuffers = []) {
  console.debug('[VisionService] Starting non-verbal analysis for', frameBuffers?.length || 0, 'frames');
  if (!frameBuffers || !frameBuffers.length) {
    console.debug('[VisionService] No frames provided for analysis.');
    return {
      framesAnalyzed: 0,
      framesWithFace: 0,
      averageDetectionConfidence: 0,
      joyScoreAverage: 0,
      joyLikelihoodMode: 'UNKNOWN'
    };
  }
  
  const results = [];
  
  for (const [i, buf] of frameBuffers.entries()) {
    try {
      console.debug(`[VisionService] Analyzing frame ${i + 1}/${frameBuffers.length}`);
      const face = await analyzeFaceFromBuffer(buf);
      if (face) {
        results.push(face);
        console.debug(`[VisionService] Frame ${i + 1}: Face found (conf ${face.detectionConfidence}, joy ${face.joyLikelihood})`);
      } else {
        console.debug(`[VisionService] Frame ${i + 1}: No face detected`);
      }
    } catch (err) {
      console.error('Vision error on frame:', err.message);
    }
  }
  
  if (!results.length) {
    console.debug('[VisionService] No faces detected in any frames.');
    return {
      framesAnalyzed: frameBuffers.length,
      framesWithFace: 0,
      averageDetectionConfidence: 0,
      joyScoreAverage: 0,
      joyLikelihoodMode: 'UNKNOWN'
    };
  }
  
  const framesWithFace = results.length;
  const avgDetection = results.reduce((sum, r) => sum + (r.detectionConfidence || 0), 0) / framesWithFace;
  
  const joyScores = results.map(r => likelihoodToScore(r.joyLikelihood));
  const avgJoyScore = joyScores.reduce((sum, s) => sum + s, 0) / joyScores.length;
  
  const freq = {};
  for (const r of results) {
    freq[r.joyLikelihood] = (freq[r.joyLikelihood] || 0) + 1;
  }
  
  let joyMode = 'UNKNOWN';
  let maxCount = 0;
  for (const [likelihood, count] of Object.entries(freq)) {
    if (count > maxCount) {
      maxCount = count;
      joyMode = likelihood;
    }
  }
  
  console.debug('[VisionService] Analysis summary:', {
    framesAnalyzed: frameBuffers.length,
    framesWithFace,
    averageDetectionConfidence: avgDetection,
    joyScoreAverage: avgJoyScore,
    joyLikelihoodMode: joyMode
  });
  
  return {
    framesAnalyzed: frameBuffers.length,
    framesWithFace,
    averageDetectionConfidence: avgDetection,
    joyScoreAverage: avgJoyScore,
    joyLikelihoodMode: joyMode
  };
}