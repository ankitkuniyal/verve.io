import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

/**
 * Analyze ONE image buffer with Vision Face Detection.
 */
async function analyzeFaceFromBuffer(imageBuffer) {
  const [result] = await client.faceDetection({
    image: { content: imageBuffer }
  });

  const faces = result.faceAnnotations || [];
  if (!faces.length) {
    return null;
  }

  const face = faces[0];
  return {
    detectionConfidence: face.detectionConfidence || 0,
    joyLikelihood: face.joyLikelihood || 'UNKNOWN'
  };
}

/**
 * Convert likelihood string to a numeric score (rough mapping)
 */
function likelihoodToScore(likelihood) {
  switch (likelihood) {
    case 'VERY_UNLIKELY': return 0;
    case 'UNLIKELY': return 1;
    case 'POSSIBLE': return 2;
    case 'LIKELY': return 3;
    case 'VERY_LIKELY': return 4;
    default: return 2; // UNKNOWN
  }
}

/**
 * Analyze multiple frames and return aggregated non-verbal metrics.
 */
export async function analyzeFramesNonVerbal(frameBuffers = []) {
  if (!frameBuffers.length) {
    return {
      framesAnalyzed: 0,
      framesWithFace: 0,
      averageDetectionConfidence: 0,
      joyScoreAverage: 0,
      joyLikelihoodMode: 'UNKNOWN'
    };
  }

  const results = [];

  for (const buf of frameBuffers) {
    try {
      const face = await analyzeFaceFromBuffer(buf);
      if (face) {
        results.push(face);
      }
    } catch (err) {
      console.error('Vision error on frame:', err.message);
    }
  }

  if (!results.length) {
    return {
      framesAnalyzed: frameBuffers.length,
      framesWithFace: 0,
      averageDetectionConfidence: 0,
      joyScoreAverage: 0,
      joyLikelihoodMode: 'UNKNOWN'
    };
  }

  const framesWithFace = results.length;
  const avgDetection =
    results.reduce((sum, r) => sum + (r.detectionConfidence || 0), 0) /
    framesWithFace;

  const joyScores = results.map((r) => likelihoodToScore(r.joyLikelihood));
  const avgJoyScore =
    joyScores.reduce((sum, s) => sum + s, 0) / joyScores.length;

  // mode of joyLikelihood
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

  return {
    framesAnalyzed: frameBuffers.length,
    framesWithFace,
    averageDetectionConfidence: avgDetection,
    joyScoreAverage: avgJoyScore,
    joyLikelihoodMode: joyMode
  };
}
