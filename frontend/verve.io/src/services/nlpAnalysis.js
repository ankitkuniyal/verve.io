// Mock NLP Analysis API - Simulates natural language processing of transcript
// This would normally analyze speech patterns, content quality, vocabulary, etc.

export const analyzeSpeechContent = async (transcript, questionContext) => {
  // Simulate API processing time
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Mock analysis based on transcript content
  const wordCount = transcript
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const sentenceCount = transcript
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0).length;

  return {
    success: true,
    analysis: {
      contentQuality: {
        relevance: Math.floor(Math.random() * 25) + 75, // 75-100
        structure: Math.floor(Math.random() * 20) + 75, // 75-95
        depth: Math.floor(Math.random() * 30) + 65, // 65-95
        clarity: Math.floor(Math.random() * 25) + 70, // 70-95
      },
      speechPatterns: {
        pace: Math.floor(Math.random() * 20) + 70, // 70-90 words per minute estimate
        fluency: Math.floor(Math.random() * 25) + 70, // 70-95
        fillerWords: Math.floor(Math.random() * 8), // 0-8
        pauses: Math.floor(Math.random() * 6), // 0-6
      },
      vocabulary: {
        diversity: Math.floor(Math.random() * 30) + 65, // 65-95
        professionalism: Math.floor(Math.random() * 25) + 70, // 70-95
        complexity: Math.floor(Math.random() * 20) + 70, // 70-90
      },
      sentiment: {
        positivity: Math.floor(Math.random() * 35) + 60, // 60-95
        confidence: Math.floor(Math.random() * 30) + 65, // 65-95
        authenticity: Math.floor(Math.random() * 25) + 70, // 70-95
      },
      metrics: {
        wordCount: wordCount,
        sentenceCount: sentenceCount,
        averageSentenceLength: wordCount / Math.max(sentenceCount, 1),
        speakingRate: Math.floor((wordCount / 60) * (70 + Math.random() * 30)), // Estimate WPM
      },
    },
    keyPhrases: generateKeyPhrases(transcript),
    improvements: generateImprovements(wordCount),
    strengths: generateStrengths(transcript),
  };
};

const generateKeyPhrases = (transcript) => {
  const mockPhrases = [
    "clear career objectives",
    "professional experience",
    "leadership examples",
    "team collaboration",
    "strategic thinking",
    "personal growth",
    "business acumen",
    "future goals",
  ];

  return mockPhrases
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((phrase) => ({
      phrase: phrase,
      count: Math.floor(Math.random() * 3) + 1,
      relevance: Math.floor(Math.random() * 20) + 80,
    }));
};

const generateImprovements = (wordCount) => {
  const improvements = [];

  if (wordCount < 100) {
    improvements.push(
      "Consider providing more detailed examples and explanations"
    );
  }

  if (wordCount > 300) {
    improvements.push("Work on being more concise in your responses");
  }

  improvements.push(
    "Incorporate more industry-specific terminology",
    "Use the STAR method more consistently for behavioral questions",
    "Include quantifiable achievements where possible"
  );

  return improvements.slice(0, 3);
};

const generateStrengths = (transcript) => {
  const strengths = [
    "Clear and logical response structure",
    "Good use of professional vocabulary",
    "Appropriate response length for the question",
    "Demonstrated self-awareness in examples",
    "Strong connection between experience and goals",
  ];

  return strengths.sort(() => Math.random() - 0.5).slice(0, 3);
};

export const analyzeAnswerStructure = (transcript, questionType) => {
  const structureElements = {
    introduction: Math.random() > 0.3,
    examples: Math.random() > 0.2,
    conclusion: Math.random() > 0.4,
    dataPoints: Math.random() > 0.6,
    personalInsights: Math.random() > 0.3,
  };

  return {
    structureScore: Math.floor(Math.random() * 30) + 65,
    missingElements: Object.entries(structureElements)
      .filter(([_, present]) => !present)
      .map(([element]) => element),
    presentElements: Object.entries(structureElements)
      .filter(([_, present]) => present)
      .map(([element]) => element),
  };
};

export const generateNLPReport = (analysisData) => {
  return {
    summary: `Speech analysis shows ${
      analysisData.contentQuality.clarity >= 85 ? "excellent" : "good"
    } clarity with ${
      analysisData.vocabulary.professionalism >= 85 ? "strong" : "appropriate"
    } professional vocabulary.`,
    talkingPoints: analysisData.keyPhrases.map((p) => p.phrase),
    recommendations: analysisData.improvements,
    overallScore: Math.floor(
      (analysisData.contentQuality.relevance +
        analysisData.speechPatterns.fluency +
        analysisData.vocabulary.diversity) /
        3
    ),
  };
};

export default {
  analyzeSpeechContent,
  analyzeAnswerStructure,
  generateNLPReport,
};
