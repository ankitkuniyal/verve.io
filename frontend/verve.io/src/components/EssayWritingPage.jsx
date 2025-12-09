import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const MIN_WORDS = 200;
const WARNING_WORDS = 150;

const SAMPLE_TOPICS = [
  { id: 1, name: 'Leadership in Digital Transformation', minWords: MIN_WORDS },
  { id: 2, name: 'Ethical Decision Making in Business', minWords: MIN_WORDS },
  { id: 3, name: 'Global Business Strategy', minWords: MIN_WORDS },
  { id: 4, name: 'Innovation and Entrepreneurship', minWords: MIN_WORDS }
];

function RenderAnalysis({ analysis }) {
  if (!analysis) return null;
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {analysis.overallAssessment?.totalScore || 0}%
        </div>
        <div className="text-lg font-semibold text-gray-700 mb-1">
          Grade: {analysis.overallAssessment?.grade || 'N/A'}
        </div>
        <div className="text-sm text-gray-600">
          {analysis.overallAssessment?.summary || 'No summary available'}
        </div>
      </div>
      {/* Section Scores */}
      {analysis.sectionScores && (
        <div>
          <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
            <i className="fas fa-star mr-2 text-yellow-500"></i>
            Section Scores
          </h6>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analysis.sectionScores).map(([key, score]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-sm text-gray-600 capitalize">{key}</div>
                <div className="text-lg font-bold text-blue-600">{score}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Spelling & Grammar Errors */}
      {(analysis.languageAnalysis?.spellingErrors?.length > 0 ||
        analysis.languageAnalysis?.grammarErrors?.length > 0) && (
        <div>
          <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2 text-red-500"></i>
            Language Issues
          </h6>
          <div className="space-y-2">
            {(analysis.languageAnalysis.spellingErrors || []).slice(0, 3).map((error, idx) => (
              <div key={'spell-' + idx} className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm">
                <span className="font-medium text-red-700">Spelling:</span> "{error.word}" → "{error.suggestion}"
              </div>
            ))}
            {(analysis.languageAnalysis.grammarErrors || []).slice(0, 3).map((error, idx) => (
              <div key={'grammar-' + idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm">
                <span className="font-medium text-yellow-700">Grammar:</span> {error.issue}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recommendations */}
      {analysis.improvementRecommendations && (
        <div>
          <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
            <i className="fas fa-lightbulb mr-2 text-green-500"></i>
            Key Recommendations
          </h6>
          <div className="space-y-2">
            {(analysis.improvementRecommendations.critical || []).slice(0, 2).map((rec, idx) => (
              <div key={'critical-' + idx} className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm">
                <span className="font-medium text-red-700">Critical:</span> {rec}
              </div>
            ))}
            {(analysis.improvementRecommendations.important || []).slice(0, 2).map((rec, idx) => (
              <div key={'important-' + idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                <span className="font-medium text-blue-700">Important:</span> {rec}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Positive Aspects */}
      {(analysis.positiveAspects?.length > 0) && (
        <div>
          <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
            <i className="fas fa-check-circle mr-2 text-green-500"></i>
            Strengths
          </h6>
          <div className="space-y-2">
            {analysis.positiveAspects.slice(0, 3).map((strength, idx) => (
              <div key={'positive-' + idx} className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm">
                {strength}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const EssayWritingPage = () => {
  const { topicId } = useParams();
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('');
  const [isFetchingTopic, setIsFetchingTopic] = useState(false);

  const fetchRandomTopic = async () => {
    setIsFetchingTopic(true);
    setError('');
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      let token = '';
      if (currentUser) {
        token = await currentUser.getIdToken();
      } else {
        token = localStorage.getItem('token') || '';
      }
      const response = await fetch(`${BACKEND_URL}/api/essay/topic`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      setTopic(data && data.topic ? data.topic : 'Write about a topic of your choice.');
    } catch (fetchErr) {
      setError('Failed to fetch random topic. Please refresh the page.');
      setTopic('Write about a topic of your choice.');
    } finally {
      setIsFetchingTopic(false);
    }
  };

  // fetch topic when not using topicId
  useEffect(() => {
    if (!topicId) {
      fetchRandomTopic();
    }
  }, [topicId]);

  // word count update
  useEffect(() => {
    const words = essay.trim() ? essay.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [essay]);

  // if topicId, set topic from sample or fallback to random
  useEffect(() => {
    if (topicId) {
      const t = SAMPLE_TOPICS.find(t => t.id === parseInt(topicId));
      if (t) {
        setTopic(t.name);
      } else {
        fetchRandomTopic();
      }
    }
    // eslint-disable-next-line
  }, [topicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wordCount < MIN_WORDS) {
      setError(`Essay must be at least ${MIN_WORDS} words. Current: ${wordCount} words.`);
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      let token = '';
      if (currentUser) {
        token = await currentUser.getIdToken();
      } else {
        token = localStorage.getItem('token') || '';
      }
      const response = await fetch(
        `${BACKEND_URL}/api/essay/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            essay,
            topic
          })
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data.analysis);
        // Save essay result to localStorage
        const essayResult = {
          ...(currentUser && { userId: currentUser.uid }),
          analysis: data.data.analysis,
          metadata: {
            topic,
            analyzedAt: new Date().toISOString(),
            wordCount
          },
          essay,
          createdAt: new Date().toISOString()
        };
        const existingResults = JSON.parse(localStorage.getItem('essayResults') || '[]');
        existingResults.push(essayResult);
        localStorage.setItem('essayResults', JSON.stringify(existingResults));
        window.dispatchEvent(new CustomEvent('essayResultUpdated', {
          detail: { score: data.data.analysis.overallAssessment?.totalScore || 0 }
        }));
      } else {
        setError(data.error || 'Failed to analyze essay');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEssay = () => {
    setEssay('');
    setAnalysis(null);
    setError('');
    setWordCount(0);
    if (!topicId) fetchRandomTopic();
  };

  const getWordCountColor = () => {
    if (wordCount < WARNING_WORDS) return 'text-red-500';
    if (wordCount < MIN_WORDS) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getWordCountMessage = () => {
    if (wordCount < WARNING_WORDS) return 'Keep writing!';
    if (wordCount < MIN_WORDS) return 'Almost there!';
    return 'Good job!';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard button */}
        <div className="flex justify-end mb-6">
          <Link
            to="/dashboard"
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Essay Writing Assessment 📝
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Write your essay on the topic below. Minimum {MIN_WORDS} words required.
              </p>
              {/* Topic Card */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-2xl p-4 border-l-4 border-yellow-400 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-lightbulb text-white"></i>
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-900 text-sm">Current Topic:</span>
                    {isFetchingTopic ? (
                      <p className="text-yellow-800 font-medium animate-pulse">Fetching topic...</p>
                    ) : (
                      <p className="text-yellow-800 font-medium">{topic}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-gray-500">
                <i className="fas fa-calendar-alt mr-2"></i>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Form/Analysis main box */}
          <div className="flex-grow xl:basis-2/3 w-full">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {!analysis ? (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <h5 className="text-xl font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-edit mr-2 text-blue-500"></i>
                      Write Your Essay
                    </h5>
                    <p className="text-gray-600 mt-1">Express your thoughts clearly and concisely.</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Essay <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={essay}
                          onChange={(e) => setEssay(e.target.value)}
                          placeholder={`Start typing your essay here... Remember to write at least ${MIN_WORDS} words. Focus on clarity, structure, and supporting your arguments with examples.`}
                          className="w-full h-96 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                          disabled={isSubmitting || isFetchingTopic}
                        />
                      </div>
                      {/* Word Count and Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className={`text-sm font-medium ${getWordCountColor()}`}>
                            <span className="text-gray-600">Words:</span> {wordCount}/{MIN_WORDS}
                          </div>
                          <div className={`text-sm ${getWordCountColor()}`}>
                            {getWordCountMessage()}
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={handleNewEssay}
                            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting || isFetchingTopic}
                          >
                            Clear
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || wordCount < MIN_WORDS || isFetchingTopic}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/25"
                          >
                            {isSubmitting ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-chart-line mr-2"></i>
                                Analyze Essay
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-center">
                            <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                            <span className="text-red-700 font-medium">{error}</span>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <h5 className="text-xl font-semibold text-gray-900 flex items-center mb-3">
                    <i className="fas fa-chart-pie mr-2 text-green-500"></i>
                    Analysis Results
                  </h5>
                  <p className="text-gray-600 mb-4">Detailed feedback on your essay:</p>
                  <RenderAnalysis analysis={analysis} />
                  <div className="border-t border-gray-200 mt-8 pt-6">
                    <button
                      onClick={handleNewEssay}
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Write Another Essay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Only show the essay preview in analysis mode (right box) */}
          {analysis && (
            <div className="xl:basis-1/3 w-full">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full min-h-[300px]">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h5 className="text-xl font-semibold text-gray-900 flex items-center">
                    <i className="fas fa-file-alt mr-2 text-blue-500"></i>
                    Your Essay
                  </h5>
                  <p className="text-gray-600 mt-1">Here is your submitted essay:</p>
                </div>
                <div className="p-6 text-gray-800 whitespace-pre-line overflow-y-auto bg-gray-50 rounded-b-2xl" style={{ minHeight: "350px", maxHeight: "600px" }}>
                  {essay}
                </div>
              </div>
            </div>
          )}

          {/* Only show tips and stats if not analyzed */}
          {!analysis && (
            <div className="xl:basis-1/3 w-full space-y-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-chart-bar mr-2 text-blue-500"></i>
                  Writing Stats
                </h6>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Word Count</span>
                    <span className={`font-semibold ${getWordCountColor()}`}>{wordCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Character Count</span>
                    <span className="font-semibold text-gray-900">{essay.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${wordCount >= MIN_WORDS ? 'text-green-500' : 'text-yellow-500'}`}>
                      {wordCount >= MIN_WORDS ? 'Ready to Submit' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Writing Tips */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-purple-500">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-graduation-cap mr-2 text-purple-500"></i>
                  Writing Tips
                </h6>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                    Start with a clear thesis statement
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                    Use specific examples to support arguments
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                    Maintain consistent paragraph structure
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                    Proofread for spelling and grammar
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                    Conclude with a strong summary
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EssayWritingPage;
