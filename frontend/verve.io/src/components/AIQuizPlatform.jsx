import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SecurityWrapper from './SecurityWrapper';
import QuizTakingInterface from './QuizTakingInterface';

const formatTime = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec === 0 ? `${min} min` : `${min} min ${sec} s`;
};

const AIQuizPlatform = () => {
  const [currentStep, setCurrentStep] = useState('exam-selection');
  const [selectedExam, setSelectedExam] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityViolations, setSecurityViolations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const navigate = useNavigate();

  const availableExams = [
    {
      id: 'cat',
      name: 'CAT (Common Admission Test)',
      description: 'Indian MBA Entrance Exam',
      duration: 120,
      sections: ['Quantitative Aptitude', 'Data Interpretation', 'Verbal Ability', 'Logical Reasoning'],
      questionTypes: ['MCQ', 'TITA'],
      pattern: 'Computer Based Test'
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Graduate Management Admission Test',
      duration: 187,
      sections: ['Quantitative Reasoning', 'Verbal Reasoning', 'Integrated Reasoning', 'Analytical Writing'],
      questionTypes: ['MCQ', 'Data Sufficiency'],
      pattern: 'Computer Adaptive Test'
    },
    {
      id: 'gre',
      name: 'GRE',
      description: 'Graduate Record Examination',
      duration: 205,
      sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
      questionTypes: ['MCQ', 'Numeric Entry'],
      pattern: 'Computer Adaptive Test'
    }
  ];

  const getAutoPreferences = (examId) => {
    const exam = availableExams.find(e => e.id === examId);
    return {
      questionCount: 10,
      difficulty: 'mixed',
      focusAreas: exam ? exam.sections : []
    };
  };

  useEffect(() => {
    if (currentStep === 'quiz-taking') {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setSecurityViolations(prev => [...prev, 'Tab switch detected']);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      const handleContextMenu = (e) => e.preventDefault();
      document.addEventListener('contextmenu', handleContextMenu);

      const handleKeyDown = (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u')) {
          e.preventDefault();
          setSecurityViolations(prev => [...prev, 'Keyboard shortcut blocked']);
        }
        if (e.key === 'F12') {
          e.preventDefault();
          setSecurityViolations(prev => [...prev, 'Developer tools blocked']);
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentStep]);

  const handleExamSelect = (examId) => {
    setSelectedExam(examId);
    handleGenerateQuiz(examId);
  };

  const handleGenerateQuiz = async (examId = selectedExam) => {
    try {
      setIsLoading(true);
      setError('');
      setAnalysis(null);

      const examConfig = availableExams.find(exam => exam.id === examId);
      const preferences = getAutoPreferences(examId);

      const response = await fetch('http://localhost:3000/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examType: examId,
          examConfig,
          preferences
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.success) {
        setQuizData(data.quiz);
        setUserAnswers(Array(data.quiz.totalQuestions).fill(null));
        setCurrentStep('quiz-taking');
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Failed to generate quiz: ' + err.message);
      console.error('Quiz generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async (answers, timeTaken) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/quiz/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizData: quizData,
          userAnswers: answers,
          timeTaken: timeTaken,
          examType: selectedExam
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze performance');
      }

      setAnalysis(data);
      setCurrentStep('detailed-analysis');
      setShowDetailedAnalysis(true);
      setShowResults(false);

    } catch (err) {
      setError('Failed to analyze performance: ' + err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [results, setResults] = useState(null);

  useEffect(() => {
    if (currentStep === 'detailed-analysis' && analysis) {
      setResults(analysis);
    }
  }, [analysis, currentStep]);

  const handleQuizCompletion = (resultsObj) => {
    setResults(resultsObj);
    setShowResults(true);
    setCurrentStep('results');
  };

  const restartProcess = () => {
    setCurrentStep('exam-selection');
    setSelectedExam('');
    setQuizData(null);
    setUserAnswers([]);
    setResults(null);
    setShowResults(false);
    setShowDetailedAnalysis(false);
    setAnalysis(null);
    setError('');
  };

  const handleViewDetailedAnalysis = () => {
    setShowDetailedAnalysis(true);
    setShowResults(false);
    setCurrentStep('detailed-analysis');
  };

  const handleBackToResults = () => {
    // Exit "full screen" and go to dashboard
    setShowDetailedAnalysis(false);
    setShowResults(false);
    setCurrentStep('exam-selection');
    setResults(null);
    setAnalysis(null);
    navigate('/dashboard');
  };


  const handleBackToQuiz = () => {
    setShowDetailedAnalysis(false);
    setShowResults(false);
    setCurrentStep('exam-selection');
    setResults(null);
    setAnalysis(null);
  };

  // DETAILED ANALYSIS PRESENTATION - as per provided JSON/format
  const analysisObj =
    showDetailedAnalysis || currentStep === 'detailed-analysis'
      ? analysis
      : results;

  // --- Begin revised DetailedAnalysisView as per instruction ---
  const DetailedAnalysisView = () => {
    // Safe data extraction with proper nesting
    const analysisData = analysisObj?.analysis || {};
    const detailedAnalysis = analysisData?.analysis || {};

    // Extract data from the correct nested structure
    const {
      overallScore = 0,
      correctAnswers = 0,
      totalQuestions = 0,
      timeTaken = 0,
      examType = 'Unknown Exam',
      questionsAppeared = [],
    } = analysisData;

    const {
      sectionScores = {},
      strengths = [],
      weaknesses = [],
      timeAnalysis = {},
      improvementPlan = {},
      comparativeAnalysis = {},
      personalizedFeedback = '',
    } = detailedAnalysis;

    const {
      timePerQuestion = 0,
      efficiencyScore = 0,
      recommendations: timeRecommendations = [],
    } = timeAnalysis;

    const {
      immediateActions = [],
      longTermStrategies = [],
      recommendedResources = [],
    } = improvementPlan;

    const { percentile = 0, benchmark = '' } = comparativeAnalysis;

    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-cyan-50 py-8">
        <div className="max-w-3xl w-full mx-auto bg-white shadow-2xl rounded-2xl p-8 border border-blue-200">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-1">
              AI Detailed Analysis
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-semibold">Exam:</span>{' '}
              {availableExams.find((e) => e.id === examType)?.name || examType}
            </p>
          </div>

          {/* OVERALL STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Score</span>
              <span className="text-3xl font-bold text-blue-600 mt-1">
                {overallScore}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Correct</span>
              <span className="text-3xl font-bold text-green-600 mt-1">
                {correctAnswers}/{totalQuestions}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Percentile</span>
              <span className="text-3xl font-bold text-purple-600 mt-1">
                {percentile}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Time</span>
              <span className="text-3xl font-bold text-orange-600 mt-1">
                {formatTime(timeTaken)}
              </span>
            </div>
          </div>

          {/* Section-wise Performance */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Section Scores</h3>
            {Object.keys(sectionScores).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(sectionScores).map(([sec, score]) => (
                  <li
                    key={sec}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-800">{sec}</span>
                    <div className="w-32 h-2 bg-gray-100 rounded-full mr-2 ml-4">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-700 ml-2">
                      {score}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-sm">
                No section data available
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-2">Strengths</h4>
                {strengths.length > 0 ? (
                  <ul className="list-inside list-disc text-green-700 text-sm">
                    {strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-green-400 text-xs">
                    No strengths identified
                  </div>
                )}
              </div>
              <div className="flex-1 bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-900 mb-2">
                  Areas for Improvement
                </h4>
                {weaknesses.length > 0 ? (
                  <ul className="list-inside list-disc text-red-700 text-sm">
                    {weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-red-400 text-xs">
                    No weaknesses identified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Analysis */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Time Analysis</h4>
            <div className="flex flex-wrap gap-6 mb-2">
              <div className="flex-1 rounded-xl bg-gray-50 p-3 flex flex-col items-center">
                <div className="text-xs text-gray-500">
                  Avg Time per Question
                </div>
                <div className="font-bold text-blue-600">
                  {formatTime(timePerQuestion)}
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-gray-50 p-3 flex flex-col items-center">
                <div className="text-xs text-gray-500">Efficiency</div>
                <div className="font-bold text-green-700">
                  {efficiencyScore}%
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-gray-50 p-3 flex flex-col items-center">
                <div className="text-xs text-gray-500">Total Time</div>
                <div className="font-bold text-blue-900">
                  {formatTime(timeTaken)}
                </div>
              </div>
            </div>
            {Array.isArray(timeRecommendations) && timeRecommendations.length > 0 ? (
              <ul className="mt-3 pl-5 list-disc text-blue-900 text-sm">
                {timeRecommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-sm mt-2">
                No specific time recommendations
              </div>
            )}
          </div>

          {/* Action Plan/Recommendations */}
          <div className="mb-6">
            <h4 className="font-semibold text-purple-900 mb-2">Improvement Plan</h4>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <span className="font-semibold text-purple-600 text-sm">
                  Immediate Actions:
                </span>
                {immediateActions.length > 0 ? (
                  <ul className="list-inside list-disc text-purple-800 text-sm mt-1">
                    {immediateActions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-purple-300 text-xs mt-1">
                    No immediate actions recommended
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-blue-700 text-sm">
                  Long term:
                </span>
                {longTermStrategies.length > 0 ? (
                  <ul className="list-inside list-disc text-blue-800 text-sm mt-1">
                    {longTermStrategies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-blue-300 text-xs mt-1">
                    No long-term strategies recommended
                  </div>
                )}
              </div>
            </div>
            <div>
              <span className="font-semibold text-pink-700 text-sm">
                Recommended Resources:
              </span>
              {recommendedResources.length > 0 ? (
                <ul className="list-inside list-disc text-pink-800 text-sm mt-1">
                  {recommendedResources.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-pink-300 text-xs mt-1">
                  No specific resources recommended
                </div>
              )}
            </div>
          </div>

          {/* Comparative Benchmark */}
          <div className="mb-6">
            <h4 className="font-semibold text-cyan-900 mb-2">
              Comparative Analysis
            </h4>
            <div className="bg-cyan-50 p-4 rounded-xl text-cyan-800">
              <div className="mb-2">
                <span className="font-semibold">Percentile:</span> {percentile}%
              </div>
              <div>
                <span className="font-semibold">Benchmark:</span>{' '}
                {benchmark || 'Not available'}
              </div>
            </div>
          </div>

          {/* Questions Appeared Table */}
          <div className="mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Questions Appeared</h4>
            {Array.isArray(questionsAppeared) && questionsAppeared.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 border-b font-semibold text-left text-gray-700">#</th>
                      <th className="px-3 py-2 border-b font-semibold text-left text-gray-700">Section</th>
                      <th className="px-3 py-2 border-b font-semibold text-left text-gray-700">Question</th>
                      <th className="px-3 py-2 border-b font-semibold text-left text-gray-700">Your Answer</th>
                      <th className="px-3 py-2 border-b font-semibold text-left text-gray-700">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionsAppeared.map((q, i) => (
                      <tr key={q.questionId || i} className="border-b last:border-b-0">
                        <td className="px-3 py-2 text-gray-900">{q.questionId ?? i + 1}</td>
                        <td className="px-3 py-2 text-gray-700">{q.section ?? '-'}</td>
                        <td className="px-3 py-2 text-gray-700 max-w-xs whitespace-pre-line">{q.questionText ?? '-'}</td>
                        <td className="px-3 py-2 text-blue-700">{q.userAnswer ?? '-'}</td>
                        <td className="px-3 py-2 text-green-700">{q.correctAnswer ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-400 text-sm mt-2">
                No data for questions appeared.
              </div>
            )}
          </div>

          {/* Personalized Feedback */}
          {personalizedFeedback ? (
            <div className="mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                Personalized Feedback
              </h4>
              <div className="bg-blue-50 p-4 rounded border border-blue-100 text-gray-800">
                {personalizedFeedback}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                Personalized Feedback
              </h4>
              <div className="bg-blue-50 p-4 rounded border border-blue-100 text-gray-800 italic">
                No personalized feedback available
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBackToResults}
              className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-cyan-600 transition-all shadow"
            >
              Dashboard
            </button>
            <button
              onClick={handleBackToQuiz}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow"
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };
  // --- End revised DetailedAnalysisView ---

  if (showDetailedAnalysis) {
    return <DetailedAnalysisView />;
  }

  // Main content is unchanged from original unless "showDetailedAnalysis"
  return (
    <SecurityWrapper violations={securityViolations}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-brain text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI MBA Prep Platform</h1>
                  <p className="text-sm text-gray-600">Powered by Backend AI Services</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-home mr-2"></i>
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {['exam-selection', 'quiz-taking', 'results'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center ${currentStep === step ? 'text-blue-600' :
                    index < ['exam-selection', 'quiz-taking', 'results'].indexOf(currentStep) ?
                      'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep === step ? 'bg-blue-600 text-white border-blue-600' :
                        index < ['exam-selection', 'quiz-taking', 'results'].indexOf(currentStep) ?
                          'bg-green-600 text-white border-green-600' : 'bg-white border-gray-300'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="text-xs mt-2 font-medium capitalize">
                      {step.replace('-', ' ')}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-24 h-1 mx-4 ${
                      index < ['exam-selection', 'quiz-taking', 'results'].indexOf(currentStep) ?
                        'bg-green-600' : 'bg-gray-300'
                      }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 mr-3 text-xl"></i>
                <div>
                  <h4 className="text-red-800 font-semibold">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">
                  {currentStep === 'quiz-taking' ?
                    'Analyzing your performance...' :
                    'Generating your quiz...'
                  }
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Communicating with verve.io server
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  It may take few minutes...
                </p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {currentStep === 'exam-selection' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Select Your Target Exam
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Choose the MBA entrance exam you're preparing for. Quiz will be auto-generated with optimal settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {availableExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white"
                      onClick={() => handleExamSelect(exam.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{exam.description}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <i className="fas fa-graduation-cap text-lg"></i>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-clock mr-2 text-blue-500"></i>
                          <span>Duration: {exam.duration} minutes</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-layer-group mr-2 text-green-500"></i>
                          <span>{exam.sections.length} Sections</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-bolt mr-2 text-purple-500"></i>
                          <span>Auto-generated (10 questions)</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all group-hover:shadow-lg">
                          Start Quiz
                          <i className="fas fa-play ml-2"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <i className="fas fa-magic text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Auto-Optimized Quizzes</h4>
                      <p className="text-blue-800 text-sm">
                        Each exam is automatically configured with optimal settings: 10 questions, mixed difficulty, and focused sections for the best practice experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'quiz-taking' && quizData && (
              <QuizTakingInterface
                quizData={quizData}
                userAnswers={userAnswers}
                onAnswersUpdate={setUserAnswers}
                onSubmit={handleQuizSubmit}
                onBack={() => setCurrentStep('exam-selection')}
              />
            )}

            {currentStep === 'results' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
                <p className="text-gray-600 mb-6">Backend AI has analyzed your performance.</p>
                <button
                  onClick={() => setShowResults(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  View AI Analysis
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Results Modal */}
        {showResults && results && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">AI Performance Analysis</h3>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Results Content */}
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {results?.overallScore ?? 0}%
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    Overall Score
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {results?.personalizedFeedback}
                  </div>
                </div>

                {/* Section-wise Performance */}
                {results?.sectionScores && Object.keys(results.sectionScores).length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Section-wise Performance</h4>
                    <div className="space-y-3">
                      {Object.entries(results.sectionScores).map(([section, score]) => (
                        <div key={section} className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">{section}</span>
                          <div className="flex items-center">
                            <div className="w-32 h-2 bg-gray-300 rounded-full mr-3">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-blue-600 w-12 text-right">{score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <i className="fas fa-check-circle mr-2"></i>
                      AI-Identified Strengths
                    </h4>
                    <ul className="space-y-2">
                      {results?.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-star text-green-600 mr-2 mt-1 text-sm"></i>
                          <span className="text-green-800 text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {results?.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-bullseye text-red-600 mr-2 mt-1 text-sm"></i>
                          <span className="text-red-800 text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <i className="fas fa-robot mr-2"></i>
                    AI Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-purple-900 mb-2">Immediate Focus</h5>
                      <ul className="space-y-1">
                        {(results?.improvementPlan?.immediateActions ?? []).map((action, index) => (
                          <li key={index} className="text-purple-800 text-sm">• {action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-900 mb-2">Study Resources</h5>
                      <ul className="space-y-1">
                        {(results?.improvementPlan?.recommendedResources ?? []).map((resource, index) => (
                          <li key={index} className="text-purple-800 text-sm">• {resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleViewDetailedAnalysis}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    <i className="fas fa-chart-bar mr-2"></i>
                    Detailed Analysis
                  </button>
                  <button
                    onClick={restartProcess}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    New Quiz
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SecurityWrapper>
  );
};

export default AIQuizPlatform;