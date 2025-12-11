import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, Loader2, MessageSquare, Shield, User, FileText, TrendingUp 
} from 'lucide-react';

export default function InterviewResults({
  results,
  isGeneratingResults,
  uploadProgress,
  apiError,
  generateResults,
  resetInterview
}) {
  if (isGeneratingResults) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-12 text-center shadow-2xl border border-slate-100">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping"></div>
             <div className="relative bg-white rounded-full p-2 w-full h-full flex items-center justify-center border-4 border-blue-100">
               <Loader2 size={40} className="animate-spin text-blue-600" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Performance</h2>
          <p className="text-slate-500 text-lg mb-8">Our AI Coach is reviewing your video, tone, and answers...</p>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
               <span>Processing</span>
               <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full relative"
                style={{ width: `${uploadProgress}%` }}
              >
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Session Completed</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">Your interview session has been recorded locally. Click below to generate your detailed AI analysis report.</p>
          <button onClick={generateResults} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all text-lg flex items-center mx-auto">
             <FileText className="mr-2" />
             Generate Analysis Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Report</h1>
              <p className="text-slate-500 mt-1">Detailed analysis of your interview session</p>
          </div>
          <Link to="/dashboard" className="mt-4 md:mt-0 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all flex items-center">
             <User className="mr-2" size={18} />
            Back to Dashboard
          </Link>
        </div>

        {/* Scores Overview */}
        <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1 rounded-3xl shadow-xl shadow-blue-500/10">
                <div className="bg-white h-full rounded-[20px] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                   <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
                   <div className="relative z-10">
                       <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 tracking-tighter">
                           {results.overallScore || 0}
                       </span>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Overall Score</div>
                   </div>
                </div>
            </div>

            <ResultScoreCard
              label="Verbal Comm."
              data={results.verbalCommunication}
              icon={<MessageSquare size={24} />}
              color="blue"
            />
            <ResultScoreCard
              label="Confidence"
              data={results.confidence}
              icon={<Shield size={24} />}
              color="purple"
            />
            <ResultScoreCard
              label="Content Quality"
              data={results.contentQuality}
              icon={<FileText size={24} />}
              color="indigo"
            />
        </div>

        {/* Deep Dive Grid */}
        <div className="grid xl:grid-cols-2 gap-8">
            <div className="space-y-8">
                <CategoryFeedback title="Verbal Communication" data={results.verbalCommunication} color="blue" />
                <CategoryFeedback title="Confidence & Presence" data={results.confidence} color="purple" />
            </div>
            <div className="space-y-8">
                <CategoryFeedback title="Content Quality" data={results.contentQuality} color="indigo" />
                <CategoryFeedback title="Non-Verbal Cues" data={results.nonVerbalCues} color="emerald" />
            </div>
        </div>

        {/* Summary & Action Plan */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                    <TrendingUp className="mr-3 text-emerald-400" />
                    Summary & Strategy
                </h2>
            </div>
            <div className="p-8 md:p-10 grid md:grid-cols-2 gap-12">
                <div>
                   <h3 className="text-emerald-600 font-bold mb-6 flex items-center uppercase tracking-wider text-sm">
                       <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                           <CheckCircle size={18} />
                       </span>
                       Key Strengths
                   </h3>
                   <ul className="space-y-4">
                      {(results.keyStrengths || []).map((s, i) => (
                        <li key={i} className="flex items-start group">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-slate-700 leading-relaxed font-medium">{s}</span>
                        </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h3 className="text-amber-600 font-bold mb-6 flex items-center uppercase tracking-wider text-sm">
                       <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-3">
                           <TrendingUp size={18} />
                       </span>
                       Areas for Growth
                   </h3>
                   <ul className="space-y-4">
                      {(results.areasForImprovement || []).map((s, i) => (
                        <li key={i} className="flex items-start group">
                          <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          </div>
                          <span className="text-slate-700 leading-relaxed font-medium">{s}</span>
                        </li>
                      ))}
                   </ul>
                </div>
            </div>
            
            {results.finalRecommendations && (
                <div className="p-8 md:p-10 bg-slate-50 border-t border-slate-100">
                     <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">🚀</span>
                        Recommended Next Steps
                     </h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        {results.finalRecommendations.map((rec, i) => (
                           <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 text-sm shadow-sm flex items-start">
                              <span className="text-blue-500 font-bold mr-2">{i+1}.</span>
                              {rec}
                           </div>
                        ))}
                     </div>
                </div>
            )}
        </div>

        <button onClick={resetInterview} className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:translate-y-[-2px]">
            Start New Session
        </button>

        {apiError && (
            <p className="text-center text-xs text-slate-400 mt-4">
              * Note: Displaying demo results due to analysis service interruption.
            </p>
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

function ResultScoreCard({ label, data, icon, color }) {
  const score = data?.score || 0;
  
  const themes = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  };
  
  const theme = themes[color] || themes.blue;

  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className={`mb-4 w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center ${theme.text} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{score}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
      
      {/* Progress Ring visual (simplified) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity" viewBox="0 0 100 100">
         <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className={theme.text} />
      </svg>
    </div>
  );
}

function CategoryFeedback({ title, data, color }) {
  const themes = {
    blue: "text-blue-600 border-blue-100",
    purple: "text-purple-600 border-purple-100",
    indigo: "text-indigo-600 border-indigo-100",
    emerald: "text-emerald-600 border-emerald-100",
  }[color];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className={`flex items-center justify-between mb-6 pb-4 border-b ${themes.split(' ')[1]}`}>
         <h3 className={`font-bold text-xl ${themes.split(' ')[0]}`}>{title}</h3>
         <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-bold font-mono">
            {data?.score || 0}/100
         </div>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <h4 className="text-xs font-extra-bold text-slate-400 uppercase tracking-widest mb-3">Analysis</h4>
          <ul className="space-y-3">
            {(data?.feedback || []).map((point, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed">
                <span className="mr-3 mt-2 w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        {data?.recommendations?.length > 0 && (
          <div className="pt-4 mt-auto">
            <h4 className="text-xs font-extra-bold text-blue-400 uppercase tracking-widest mb-3">Coach Tips</h4>
            <div className="bg-blue-50/50 rounded-xl p-4 space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start leading-relaxed list-none">
                  <span className="mr-2">💡</span>
                  {rec}
                </li>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
