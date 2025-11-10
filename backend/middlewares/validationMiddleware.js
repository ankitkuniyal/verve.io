export const validateQuizGeneration = (req, res, next) => {
    const { examType, examConfig, preferences } = req.body;
  
    if (!examType || !examConfig || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: examType, examConfig, preferences'
      });
    }
  
    if (!examConfig.name || !examConfig.duration || !examConfig.sections) {
      return res.status(400).json({
        success: false,
        error: 'Invalid examConfig structure'
      });
    }
  
    if (!preferences.questionCount || !preferences.difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Invalid preferences structure'
      });
    }
  
    next();
  };
  
  export const validateQuizAnalysis = (req, res, next) => {
    const { quizData, userAnswers, timeTaken, examType } = req.body;
  
    if (!quizData || !userAnswers || timeTaken === undefined || !examType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: quizData, userAnswers, timeTaken, examType'
      });
    }
  
    if (!Array.isArray(userAnswers)) {
      return res.status(400).json({
        success: false,
        error: 'userAnswers must be an array'
      });
    }
  
    next();
  };