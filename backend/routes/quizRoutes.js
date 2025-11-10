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

export default router;