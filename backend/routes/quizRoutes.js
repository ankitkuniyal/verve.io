import express from 'express';
import {
  generateQuiz,
  analyzeQuizPerformance
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('hello');
});

// Quiz Generation Route
router.post('/generate', generateQuiz);

// Quiz Analysis Route
router.post('/analysis', analyzeQuizPerformance);


// POST /firebase.js -- Add data to Firebase Firestore
import { db } from '../config/firebase.js';

router.post('/backup', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      error: 'Firebase database is not initialized on the server.'
    });
  }

  try {
    const data = req.body;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be a JSON object with data to add to Firestore.'
      });
    }

    // Default collection name (can be customized as needed)
    const collection = req.query.collection || 'quiz_submissions';

    const docRef = await db.collection(collection).add(data);

    res.json({
      success: true,
      message: 'Data added to Firestore successfully.',
      docId: docRef.id
    });
  } catch (error) {
    console.error('Firebase add error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add data to Firebase Firestore.',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});



export default router;