import express from 'express';
import {
  analyzeEssay,
  bulkAnalyzeEssays,
  getAnalysisHealth
} from '../controllers/essayController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
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

// Routes
router.post('/analyze', validateEssayInput, analyzeEssay);

router.post('/bulk-analyze', validateBulkInput, bulkAnalyzeEssays);

router.get('/health', getAnalysisHealth);


export default router;