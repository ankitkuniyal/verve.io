// Mock Performance Evaluator - Combines vision and NLP analysis for overall scoring
// This would normally integrate multiple AI services for comprehensive evaluation

import { analyzeVideoFeed, generateVisionReport } from "./visionAnalysis";
import { analyzeSpeechContent, generateNLPReport } from "./nlpAnalysis";

export const evaluateInterviewPerformance = async (
  videoBlob,
  transcript,
  question
) => {
  // Simulate parallel analysis of video and speech
  const [visionResults, nlpResults] = await Promise.all([
    analyzeVideoFeed(videoBlob),
    analyzeSpeechContent(transcript, question),
  ]);

  // Combine results for overall evaluation
  return combineAnalyses(visionResults, nlpResults, question);
};

const combineAnalyses = (visionResults, nlpResults, question) => {
  const visionScores = visionResults.analysis;
  const nlpScores = nlpResults.analysis;

  // Calculate weighted overall score
  const overallScore = calculateOverallScore(visionScores, nlpScores);

  // Generate comprehensive feedback
  const feedback = generateComprehensiveFeedback(
    visionResults,
    nlpResults,
    overallScore
  );

  return {
    overallScore: overallScore,
    categoryScores: {
      communication: calculateCommunicationScore(nlpScores, visionScores),
      content: calculateContentScore(nlpScores),
      presence: calculatePresenceScore(visionScores),
      professionalism: calculateProfessionalismScore(visionScores, nlpScores),
    },
    detailedFeedback: feedback,
    recommendations: generatePersonalizedRecommendations(
      visionResults,
      nlpResults,
      overallScore
    ),
    questionAnalysis: analyzeQuestionResponse(question, nlpResults),
    improvementAreas: identifyImprovementAreas(visionResults, nlpResults),
  };
};

const calculateOverallScore = (vision, nlp) => {
  const weights = {
    communication: 0.3, // NLP heavy
    content: 0.3, // NLP heavy
    presence: 0.2, // Vision heavy
    professionalism: 0.2, // Balanced
  };

  const communication =
    (nlp.speechPatterns.fluency + nlp.contentQuality.clarity) / 2;
  const content = (nlp.contentQuality.relevance + nlp.contentQuality.depth) / 2;
  const presence =
    (vision.facialExpressions.confidence +
      vision.overallImpression.confidence) /
    2;
  const professionalism =
    (vision.overallImpression.professionalism +
      nlp.vocabulary.professionalism) /
    2;

  return Math.floor(
    communication * weights.communication +
      content * weights.content +
      presence * weights.presence +
      professionalism * weights.professionalism
  );
};

const calculateCommunicationScore = (nlp, vision) => {
  return Math.floor(
    (nlp.speechPatterns.fluency +
      nlp.contentQuality.clarity +
      vision.facialExpressions.engagement) /
      3
  );
};

const calculateContentScore = (nlp) => {
  return Math.floor(
    (nlp.contentQuality.relevance +
      nlp.contentQuality.depth +
      nlp.vocabulary.diversity) /
      3
  );
};

const calculatePresenceScore = (vision) => {
  return Math.floor(
    (vision.eyeContact.consistency +
      vision.posture.upright +
      vision.overallImpression.confidence) /
      3
  );
};

const calculateProfessionalismScore = (vision, nlp) => {
  return Math.floor(
    (vision.overallImpression.professionalism +
      nlp.vocabulary.professionalism +
      vision.posture.professional) /
      3
  );
};

const generateComprehensiveFeedback = (vision, nlp, overallScore) => {
  const feedback = {
    strengths: [],
    areasForImprovement: [],
    insights: [],
  };

  // Strengths
  if (nlp.analysis.contentQuality.relevance >= 85) {
    feedback.strengths.push("Highly relevant and on-topic responses");
  }
  if (vision.analysis.eyeContact.consistency >= 85) {
    feedback.strengths.push("Excellent eye contact maintained throughout");
  }
  if (nlp.analysis.vocabulary.professionalism >= 85) {
    feedback.strengths.push("Strong professional vocabulary usage");
  }
  if (vision.analysis.facialExpressions.engagement >= 85) {
    feedback.strengths.push("Engaging and positive facial expressions");
  }

  // Areas for improvement
  if (nlp.analysis.speechPatterns.fillerWords > 5) {
    feedback.areasForImprovement.push("Reduce use of filler words in speech");
  }
  if (vision.analysis.posture.stability < 75) {
    feedback.areasForImprovement.push(
      "Work on maintaining more stable posture"
    );
  }
  if (nlp.analysis.contentQuality.depth < 75) {
    feedback.areasForImprovement.push(
      "Provide more detailed examples and insights"
    );
  }

  // Insights
  feedback.insights.push(
    `Your communication style is ${
      overallScore >= 85 ? "highly effective" : "developing well"
    }`,
    `${
      vision.analysis.gestures.natural >= 80
        ? "Natural gestures"
        : "Consider using more deliberate gestures"
    } enhance your presentation`,
    `${
      nlp.analysis.sentiment.confidence >= 80
        ? "Confident tone"
        : "Work on projecting more confidence"
    } in your delivery`
  );

  return feedback;
};

const generatePersonalizedRecommendations = (vision, nlp, overallScore) => {
  const recommendations = [
    "Practice with mock interviews to build consistency",
    "Record yourself answering common MBA questions",
    "Study successful MBA interview examples online",
  ];

  if (overallScore < 80) {
    recommendations.push(
      "Focus on structuring responses using the STAR method"
    );
    recommendations.push(
      "Work on reducing nervous habits and maintaining composure"
    );
  }

  if (vision.analysis.eyeContact.consistency < 80) {
    recommendations.push("Practice maintaining eye contact with camera lens");
  }

  if (nlp.analysis.speechPatterns.fillerWords > 3) {
    recommendations.push(
      "Use brief pauses instead of filler words when thinking"
    );
  }

  return recommendations.slice(0, 5);
};

const analyzeQuestionResponse = (question, nlp) => {
  return {
    questionType: classifyQuestion(question),
    responseAppropriateness: nlp.analysis.contentQuality.relevance,
    answerLength: nlp.analysis.metrics.wordCount > 150 ? "Detailed" : "Concise",
    structureQuality:
      nlp.analysis.contentQuality.structure >= 80
        ? "Well-structured"
        : "Needs improvement",
  };
};

const classifyQuestion = (question) => {
  if (question.toLowerCase().includes("leadership")) return "behavioral";
  if (question.toLowerCase().includes("goal")) return "career";
  if (question.toLowerCase().includes("team")) return "collaboration";
  if (question.toLowerCase().includes("fail")) return "self-awareness";
  return "general";
};

const identifyImprovementAreas = (vision, nlp) => {
  const areas = [];

  if (vision.analysis.eyeContact.consistency < 85) {
    areas.push("Eye Contact Consistency");
  }
  if (nlp.analysis.speechPatterns.fluency < 80) {
    areas.push("Speech Fluency");
  }
  if (nlp.analysis.contentQuality.depth < 75) {
    areas.push("Answer Depth");
  }
  if (vision.analysis.posture.professional < 80) {
    areas.push("Professional Posture");
  }

  return areas;
};

// Real-time evaluation during recording
export const simulateRealTimeEvaluation = (callback) => {
  const metrics = [
    "confidence",
    "clarity",
    "engagement",
    "relevance",
    "professionalism",
    "eye_contact",
    "posture",
  ];

  let intervalId = null;

  return {
    start: () => {
      intervalId = setInterval(() => {
        const randomMetric =
          metrics[Math.floor(Math.random() * metrics.length)];
        const score = Math.floor(Math.random() * 25) + 70; // 70-95

        callback({
          metric: randomMetric,
          score: score,
          trend: Math.random() > 0.5 ? "improving" : "stable",
          suggestion: getRealTimeSuggestion(randomMetric, score),
          timestamp: Date.now(),
        });
      }, 4000);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};

const getRealTimeSuggestion = (metric, score) => {
  const suggestions = {
    confidence:
      score < 75 ? "Speak with more conviction" : "Good confidence level",
    clarity:
      score < 75 ? "Enunciate words more clearly" : "Clear communication",
    engagement: score < 75 ? "Show more enthusiasm" : "Good engagement",
    relevance:
      score < 75 ? "Stay more focused on the question" : "Relevant response",
    professionalism:
      score < 75 ? "Use more formal language" : "Professional tone",
    eye_contact: score < 75 ? "Look directly at camera" : "Good eye contact",
    posture: score < 75 ? "Sit up straighter" : "Good posture",
  };

  return suggestions[metric] || "Continue current approach";
};

export default {
  evaluateInterviewPerformance,
  simulateRealTimeEvaluation,
};
