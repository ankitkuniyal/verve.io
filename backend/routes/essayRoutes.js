import express from 'express';
import {
  analyzeEssay,
  getAnalysisHealth
} from '../controllers/essayController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Input validation middleware
const validateEssayInput = (req, res, next) => {
  const { essay } = req.body;
  
  if (!essay || typeof essay !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Essay must be a string'
    });
  }

  if (essay.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: 'Essay must be at least 50 characters long'
    });
  }

  if (essay.length > 10000) {
    return res.status(400).json({
      success: false,
      error: 'Essay must not exceed 10,000 characters'
    });
  }

  next();
};

const validateBulkInput = (req, res, next) => {
  const { essays } = req.body;

  if (!Array.isArray(essays)) {
    return res.status(400).json({
      success: false,
      error: 'Essays must be an array'
    });
  }

  if (essays.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Essays array cannot be empty'
    });
  }

  if (essays.length > 5) {
    return res.status(400).json({
      success: false,
      error: 'Bulk analysis limited to 5 essays maximum'
    });
  }

  for (let i = 0; i < essays.length; i++) {
    const essayData = essays[i];
    if (!essayData.essay || typeof essayData.essay !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Essay at index ${i} must be a string`
      });
    }
  }

  next();
};

// Random 10 word essay topic generation route with in-memory caching and fallback topics
import crypto from 'crypto';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const topicCache = {
  topic: null,
  timestamp: 0
};

// Hardcoded fallback 10-word topics (should all be exactly 10 words)
const fallbackTopics = [
  "How digital transformation is reshaping global business leadership today",
  "Ethical dilemmas encountered by leaders in rapidly changing business environments",
  "The impact of artificial intelligence on traditional education and learning",
  "Fostering innovation through diverse teams in international business settings",
  "Balancing corporate profits with environmental responsibility in modern society",
  "The evolving role of entrepreneurship in solving global societal challenges",
  "Cultural intelligence as an asset in multinational business negotiations today",
  "How remote work trends affect team morale and business productivity",
  "Leveraging big data analytics for smarter management decision making processes",
  "Challenges and opportunities of leading cross-generational workforces collaboratively"
];

// Get a random fallback topic
function getRandomFallbackTopic() {
  // Use crypto.randomInt for more secure randomness (if available)
  const idx = crypto?.randomInt
    ? crypto.randomInt(0, fallbackTopics.length)
    : Math.floor(Math.random() * fallbackTopics.length);
  return fallbackTopics[idx];
}

router.get('/topic', authenticateToken, async (req, res) => {
  // First: return cached topic if recent enough
  const now = Date.now();
  if (topicCache.topic && (now - topicCache.timestamp < CACHE_TTL_MS)) {
    return res.json({ success: true, topic: topicCache.topic, cached: true });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `Suggest a creative, original, and thought-provoking essay topic in approximately 10 words. Respond with only the topic text, nothing else.`;
    const modelNames = ['gemini-2.0-flash-lite', 'gemini-2.5-flash'];
    let topic = null;
    let lastError = null;
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```.*?\n?/g, '').replace(/\n/g, ' ').trim();
        // Try to extract strictly 10 words
        const words = text.split(/\s+/).filter(Boolean).slice(0, 10);
        if (words.length === 10) {
          topic = words.join(' ');
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    // Use model result if successful
    if (topic) {
      topicCache.topic = topic;
      topicCache.timestamp = Date.now();
      return res.json({ success: true, topic });
    }

    // Fallback to hardcoded topic if AI fails (cache this as well)
    const fallbackTopic = getRandomFallbackTopic();
    topicCache.topic = fallbackTopic;
    topicCache.timestamp = Date.now();
    return res.json({
      success: true,
      topic: fallbackTopic,
      fallback: true,
      error: 'Failed to generate topic with Gemini, used fallback',
      details: lastError?.message || undefined
    });

  } catch (err) {
    // Fallback to hardcoded topic on error (cache)
    const fallbackTopic = getRandomFallbackTopic();
    topicCache.topic = fallbackTopic;
    topicCache.timestamp = Date.now();
    return res.json({
      success: true,
      topic: fallbackTopic,
      fallback: true,
      error: 'Failed to connect to Gemini AI, using fallback',
      details: err.message
    });
  }
});

router.post('/analyze', authenticateToken, validateEssayInput, analyzeEssay);

router.get('/health', getAnalysisHealth);


export default router;