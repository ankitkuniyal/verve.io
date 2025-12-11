import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  BarChart2, 
  PenTool, 
  RotateCcw,
  Send,
  Loader2,
  BookOpen,
  Sparkles
} from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-xl shadow-blue-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Overall Score</div>
           <div className="text-7xl font-black mb-4 tracking-tight drop-shadow-sm">{analysis.overallAssessment?.totalScore || 0}</div>
           <div className="inline-block bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-sm font-bold border border-white/20">Grade: {analysis.overallAssessment?.grade || 'N/A'}</div>
        </div>
        <div className="col-span-2 bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-900 pointer-events-none">
              <Sparkles size={120} />
           </div>
           <div className="relative z-10 w-full">
              <h5 className="font-bold text-xl text-slate-900 mb-4 flex items-center">
                 <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                 AI Assessment Summary
              </h5>
              <p className="text-slate-600 leading-relaxed text-base">
                {analysis.overallAssessment?.summary || 'No summary available.'}
              </p>
           </div>
        </div>
      </div>

      {/* Section Scores */}
      {analysis.sectionScores && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
          <h6 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
            <BarChart2 className="w-6 h-6 mr-3 text-blue-600" />
            Category Breakdown
          </h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(analysis.sectionScores).map(([key, score]) => (
              <div key={key} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 group-hover:text-blue-600 transition-colors">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-3xl font-black text-slate-800 mb-2">
                  <span className={score >= 7 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-500'}>
                    {score}
                  </span>
                  <span className="text-slate-300 text-xl font-medium">/10</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ease-out ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                     style={{ width: `${score * 10}%` }}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Improvement Recommendations */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 h-full">
          <h6 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
            <Lightbulb className="w-6 h-6 mr-3 text-amber-500" />
            Key Improvements
          </h6>
          <div className="space-y-4">
             {(analysis.improvementRecommendations?.critical || []).slice(0, 3).map((rec, idx) => (
                <div key={'crit-'+idx} className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl hover:shadow-md transition-shadow">
                   <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-900 leading-relaxed">{rec}</p>
                   </div>
                </div>
             ))}
             {(analysis.improvementRecommendations?.important || []).slice(0, 3).map((rec, idx) => (
                <div key={'imp-'+idx} className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium text-amber-900 leading-relaxed">{rec}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Strengths & Grammar */}
        <div className="space-y-6">
           {/* Positive Aspects */}
           {(analysis.positiveAspects?.length > 0) && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h6 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
                  Strengths
                </h6>
                <div className="space-y-3">
                  {analysis.positiveAspects.slice(0, 3).map((strength, idx) => (
                    <div key={'pos-'+idx} className="flex items-start bg-green-50 p-4 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                       <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                       <span className="text-sm font-medium text-green-900 leading-relaxed">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Grammar */}
            {(analysis.languageAnalysis?.grammarErrors?.length > 0) && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h6 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
                  <PenTool className="w-6 h-6 mr-3 text-indigo-500" />
                  Language Corrections
                </h6>
                <div className="space-y-3">
                   {analysis.languageAnalysis.grammarErrors.slice(0, 2).map((error, idx) => (
                      <div key={'gram-'+idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm hover:border-indigo-200 transition-colors">
                         <span className="font-bold text-slate-800 block mb-1">Correction:</span>
                         <span className="text-slate-600 leading-relaxed">{error.issue}</span>
                      </div>
                   ))}
                </div>
              </div>
            )}
        </div>
      </div>
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
      setError('Failed to fetch random topic. Please try again.');
      setTopic('Describe a significant leadership experience and its impact.');
    } finally {
      setIsFetchingTopic(false);
    }
  };

  useEffect(() => {
    if (!topicId) {
      fetchRandomTopic();
    }
  }, [topicId]);

  useEffect(() => {
    const words = essay.trim() ? essay.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [essay]);

  useEffect(() => {
    if (topicId) {
      const t = SAMPLE_TOPICS.find(t => t.id === parseInt(topicId));
      if (t) {
        setTopic(t.name);
      } else {
        fetchRandomTopic();
      }
    }
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
        // Scroll to top to see results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Failed to analyze essay');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
    if (wordCount < MIN_WORDS) return 'text-amber-500';
    return 'text-green-600';
  };

  const getWordCountPercentage = () => {
      const percentage = (wordCount / MIN_WORDS) * 100;
      return Math.min(percentage, 100);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard button */}
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform transition-transform hover:scale-105">
                 <BookOpen size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Essay Coach</h1>
                <p className="text-slate-500 text-sm font-medium">AI-Powered Writing Assessment</p>
             </div>
           </div>
           
           <Link
            to="/dashboard"
            className="group bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md border border-slate-200 flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Column - Full width if analyzed */}
          <div className={`flex-grow transition-all duration-500 ${analysis ? 'w-full' : 'xl:basis-2/3 w-full'}`}>
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              
              {!analysis ? (
                <>
                  {/* Topic Header for Drafting */}
                  <div className="p-10 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">Current Topic</span>
                        <div className="text-indigo-600 text-sm font-bold flex items-center bg-indigo-50 px-3 py-1 rounded-lg">
                            <PenTool size={16} className="mr-2" />
                            Drafting Mode
                        </div>
                    </div>
                    {isFetchingTopic ? (
                        <div className="space-y-3">
                           <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4"></div>
                           <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                        </div>
                    ) : (
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">"{topic}"</h2>
                    )}
                  </div>

                  {/* Editor */}
                  <div className="p-10">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-8 relative group">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -m-2 pointer-events-none"></div>
                        <textarea
                          value={essay}
                          onChange={(e) => setEssay(e.target.value)}
                          placeholder="Start writing your essay here. Focus on a strong introduction, clear supporting arguments, and a concise conclusion..."
                          className="w-full min-h-[500px] p-8 text-lg leading-relaxed text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl resize-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400"
                          disabled={isSubmitting || isFetchingTopic}
                        />
                         {/* Floating Word Counter */}
                         <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-xl shadow-lg text-xs font-bold text-slate-600 flex items-center gap-2.5 transition-transform hover:scale-105">
                             <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${wordCount >= MIN_WORDS ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`}></div>
                             {wordCount} Words
                         </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-white rounded-3xl p-2">
                         
                         {/* New Progress Bar */}
                         <div className="flex-1 max-w-md">
                            <div className="flex justify-between text-xs font-bold uppercase text-slate-400 mb-2">
                                <span>Minimum Requirement</span>
                                <span className={getWordCountColor()}>{Math.round(getWordCountPercentage())}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                <div 
                                    className={`h-full transition-all duration-700 ease-out rounded-full ${wordCount >= MIN_WORDS ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} 
                                    style={{ width: `${getWordCountPercentage()}%` }}
                                ></div>
                            </div>
                         </div>

                         <div className="flex gap-4">
                           <button
                             type="button"
                             onClick={handleNewEssay}
                             className="px-6 py-4 border-2 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all font-bold text-sm flex items-center"
                             disabled={isSubmitting}
                           >
                             <RotateCcw size={18} className="mr-2" />
                             Clear
                           </button>
                           <button
                             type="submit"
                             disabled={isSubmitting || wordCount < MIN_WORDS || isFetchingTopic}
                             className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:grayscale transition-all font-bold text-sm shadow-md flex items-center transform hover:-translate-y-0.5"
                           >
                             {isSubmitting ? (
                               <>
                                 <Loader2 size={18} className="mr-2 animate-spin" />
                                 Analyzing...
                               </>
                             ) : (
                               <>
                                 <Send size={18} className="mr-2" />
                                 Analyze Essay
                               </>
                             )}
                           </button>
                         </div>
                      </div>

                      {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 animate-fade-in">
                           <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertTriangle size={20} /></div>
                           <span className="text-red-800 font-medium">{error}</span>
                        </div>
                      )}
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-0">
                  {/* Analysis Header */}
                  <div className="p-10 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h5 className="text-2xl font-black text-slate-900 flex items-center mb-2">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-sm">
                           <Sparkles size={24} />
                        </div>
                        Analysis Results
                      </h5>
                      <p className="text-slate-500 ml-16">Here is the detailed breakdown of your submission.</p>
                    </div>
                    <button
                       onClick={handleNewEssay}
                       className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center"
                     >
                       <PenTool size={16} className="mr-2" />
                       Write New Essay
                     </button>
                  </div>
                  <div className="p-10 bg-slate-50/30">
                    <RenderAnalysis analysis={analysis} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar / Tips Column - ONLY SHOW IF NOT ANALYZING */}
          {!analysis && (
            <div className="xl:basis-1/3 w-full animate-fade-in-up">
               {/* Tips Card */}
               <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden group border-4 border-slate-900">
                 {/* Decorative background elements */}
                 <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                     <Lightbulb size={180} />
                 </div>
                 <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl"></div>
                 
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-lg">
                        <Lightbulb size={32} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-6 tracking-tight">Pro Writing Tips</h3>
                    <ul className="space-y-6 text-indigo-100 text-sm font-medium">
                        <li className="flex gap-4 items-start group/item">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            <p className="leading-relaxed opacity-90 group-hover/item:opacity-100">Start with a compelling hook to grab attention immediately in your introduction.</p>
                        </li>
                        <li className="flex gap-4 items-start group/item">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            <p className="leading-relaxed opacity-90 group-hover/item:opacity-100">Use the <span className="text-white font-bold border-b border-indigo-400/50">STAR method</span> (Situation, Task, Action, Result) for clear behavioral examples.</p>
                        </li>
                        <li className="flex gap-4 items-start group/item">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            <p className="leading-relaxed opacity-90 group-hover/item:opacity-100">Keep paragraphs focused on a single main idea to maintain good flow.</p>
                        </li>
                        <li className="flex gap-4 items-start group/item">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            <p className="leading-relaxed opacity-90 group-hover/item:opacity-100">End with a strong conclusion that connects your story back to your career goals.</p>
                        </li>
                    </ul>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EssayWritingPage;
