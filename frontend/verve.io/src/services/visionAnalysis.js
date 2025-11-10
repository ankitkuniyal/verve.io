// Mock Vision Analysis API - Simulates computer vision analysis of video feed
// This would normally analyze facial expressions, eye contact, posture, etc.

export const analyzeVideoFeed = async (videoBlob) => {
  // Simulate API processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock analysis results based on common patterns
  return {
    success: true,
    analysis: {
      facialExpressions: {
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100
        engagement: Math.floor(Math.random() * 25) + 75, // 75-100
        positivity: Math.floor(Math.random() * 30) + 70, // 70-100
        calmness: Math.floor(Math.random() * 25) + 75, // 75-100
      },
      eyeContact: {
        consistency: Math.floor(Math.random() * 20) + 75, // 75-95
        duration: Math.floor(Math.random() * 15) + 80, // 80-95
        breaks: Math.floor(Math.random() * 5) + 1, // 1-6
      },
      posture: {
        upright: Math.floor(Math.random() * 25) + 70, // 70-95
        stability: Math.floor(Math.random() * 20) + 75, // 75-95
        professional: Math.floor(Math.random() * 30) + 65, // 65-95
      },
      gestures: {
        natural: Math.floor(Math.random() * 25) + 70, // 70-95
        appropriate: Math.floor(Math.random() * 20) + 75, // 75-95
        distracting: Math.floor(Math.random() * 10), // 0-10
      },
      overallImpression: {
        professionalism: Math.floor(Math.random() * 25) + 75, // 75-100
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        authenticity: Math.floor(Math.random() * 20) + 75, // 75-95
      },
    },
    recommendations: [
      "Maintain slightly more consistent eye contact with the camera",
      "Consider using hand gestures more deliberately to emphasize points",
      "Good overall posture and professional demeanor maintained",
      "Facial expressions show appropriate engagement and positivity",
    ],
    warnings: [
      "Occasional brief breaks in eye contact detected",
      "Minor posture shifts observed but within acceptable range",
    ],
  };
};

export const generateVisionReport = (analysisData) => {
  return {
    summary: `Vision analysis detected ${
      analysisData.facialExpressions.confidence >= 85 ? "high" : "moderate"
    } confidence levels with ${
      analysisData.eyeContact.consistency >= 85 ? "excellent" : "good"
    } eye contact consistency.`,
    strengths: [
      `Strong ${
        analysisData.facialExpressions.engagement >= 85 ? "and engaged" : ""
      } facial expressions`,
      `${
        analysisData.posture.upright >= 85 ? "Excellent" : "Good"
      } upright posture maintained`,
      `${
        analysisData.gestures.natural >= 85
          ? "Natural and appropriate"
          : "Generally appropriate"
      } gesture usage`,
    ],
    improvements: [
      analysisData.eyeContact.consistency < 80
        ? "Work on maintaining more consistent eye contact"
        : null,
      analysisData.gestures.distracting > 5
        ? "Reduce occasional distracting movements"
        : null,
      analysisData.posture.stability < 80
        ? "Improve posture stability during longer responses"
        : null,
    ].filter(Boolean),
  };
};

// Mock real-time analysis during recording
export const simulateRealTimeAnalysis = (callback) => {
  const metrics = ["eye_contact", "posture", "engagement", "facial_expression"];
  let intervalId = null;

  return {
    start: () => {
      intervalId = setInterval(() => {
        const randomMetric =
          metrics[Math.floor(Math.random() * metrics.length)];
        const score = Math.floor(Math.random() * 20) + 80; // 80-100

        callback({
          metric: randomMetric,
          score: score,
          timestamp: Date.now(),
          message: `${randomMetric.replace("_", " ")}: ${
            score >= 90
              ? "Excellent"
              : score >= 80
              ? "Good"
              : "Needs improvement"
          }`,
        });
      }, 3000);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};

export default {
  analyzeVideoFeed,
  generateVisionReport,
  simulateRealTimeAnalysis,
};
