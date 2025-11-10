import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DetailedAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // IMPORTANT: Use 'analysis' not 'results'
  const { analysis, quizData, userAnswers, selectedExam } = location.state || {};

  console.log('Analysis data received:', analysis); // Debug log

  // Safe data extraction with fallbacks - match your backend response structure
  const analysisData = analysis?.analysis || {};
  const {
    overallScore = 0,
    correctAnswers = 0,
    totalQuestions = 0,
    timeTaken = 0,
    examType = 'Unknown Exam'
  } = analysis || {};

  const {
    sectionScores = {},
    strengths = [],
    weaknesses = [],
    timeAnalysis = {},
    improvementPlan = {},
    comparativeAnalysis = {},
    personalizedFeedback = ''
  } = analysisData;

  const {
    timePerQuestion = 0,
    efficiencyScore = 0,
    recommendations: timeRecommendations = []
  } = timeAnalysis;

  const {
    immediateActions = [],
    longTermStrategies = [],
    recommendedResources = []
  } = improvementPlan;

  const { percentile = 'N/A' } = comparativeAnalysis;

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Data</h1>
          <button 
            onClick={() => navigate('/ai-quiz')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Take a Quiz First
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detailed AI Analysis</h1>
            <p className="text-gray-600">Powered by verve.io - {selectedExam?.name || examType}</p>
          </div>
          <button
            onClick={() => navigate('/ai-quiz')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Back to Quiz
          </button>
        </div>

        {/* Overall Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{overallScore}%</div>
            <div className="text-gray-600">Overall Score</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {percentile}%
            </div>
            <div className="text-gray-600">Percentile</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {Math.round(timeTaken / 60)}min
            </div>
            <div className="text-gray-600">Time Taken</div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strengths</h2>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No strengths identified</p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Areas for Improvement</h2>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No weaknesses identified</p>
            )}
          </div>
        </div>

        {/* Section-wise Breakdown */}
        {Object.keys(sectionScores).length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Section-wise Performance</h2>
            <div className="space-y-4">
              {Object.entries(sectionScores).map(([section, score]) => (
                <div key={section} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-900">{section}</span>
                      <span className="font-bold text-blue-600">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Time Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {timePerQuestion}s
              </div>
              <div className="text-gray-600">Avg Time per Question</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {efficiencyScore}%
              </div>
              <div className="text-gray-600">Efficiency Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(timeTaken / 60)}min
              </div>
              <div className="text-gray-600">Total Time</div>
            </div>
          </div>
          {timeRecommendations.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Recommendations:</h3>
              <ul className="space-y-1">
                {timeRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="text-blue-500 mr-2">⏱</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Question-by-Question Analysis */}
        {quizData && userAnswers && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Analysis</h2>
            <div className="space-y-4">
              {quizData.sections?.map((section, sectionIndex) =>
                section.questions?.map((question, questionIndex) => {
                  const globalIndex = quizData.sections.slice(0, sectionIndex).reduce((sum, s) => sum + (s.questions?.length || 0), 0) + questionIndex;
                  const userAnswer = userAnswers[globalIndex];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={globalIndex} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'} bg-gray-50 p-4 rounded-r-lg`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">
                            Q{globalIndex + 1}: {section.name}
                          </span>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">{question.difficulty || 'Unknown'}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Your Answer:</strong>{' '}
                          {userAnswer !== null && userAnswer !== undefined && question.options?.[userAnswer] ? 
                            `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}` : 
                            'Not answered'
                          }
                        </div>
                        <div>
                          <strong>Correct Answer:</strong>{' '}
                          {question.correctAnswer !== undefined && question.options?.[question.correctAnswer] ? 
                            `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}` :
                            'Not available'
                          }
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <strong className="text-blue-900">AI Explanation:</strong>
                          <p className="text-blue-800 text-sm mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Action Plan */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">AI Recommended Action Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Immediate Focus (Next 7 days)</h3>
              {immediateActions.length > 0 ? (
                <ul className="space-y-2">
                  {immediateActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-300 mr-2">⚡</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-purple-200">No immediate actions recommended</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-3">Long-term Strategy</h3>
              {longTermStrategies.length > 0 ? (
                <ul className="space-y-2">
                  {longTermStrategies.map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-300 mr-2">📅</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-purple-200">No long-term strategies recommended</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Resources */}
        {recommendedResources.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedResources.map((resource, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-500 mr-3">📚</span>
                  <span className="text-gray-700">{resource}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Feedback */}
        {personalizedFeedback && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalized Feedback</h2>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 leading-relaxed">{personalizedFeedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalysis;