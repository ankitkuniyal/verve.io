import React from 'react';
import { Video, CheckCircle, Loader2, Play, ArrowRight } from 'lucide-react';

export default function InterviewWelcome({
  questions,
  targetSchool,
  remainingCredits,
  browserWarning,
  cameraError,
  isLoadingCamera,
  startCamera,
  resetInterview
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10 text-center space-y-8">
          
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                 <Video size={40} className="text-blue-600" />
              </div>
            </div>
            {remainingCredits !== null && (
               <div className="absolute -bottom-2 -right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 shadow-sm">
                 {remainingCredits} Credits
               </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Check</h2>
            <p className="text-slate-500 mt-2 text-lg">
              We've prepared <span className="text-blue-600 font-bold">{questions.length} questions</span> tailored for {targetSchool || "your interview"}.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Interview Flow</h3>
            <div className="space-y-4">
               <div className="flex items-center group">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-4 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-sm">
                   <span className="font-bold text-sm">1</span>
                 </div>
                 <div className="flex-1">
                   <p className="font-semibold text-slate-800">Review & Prepare</p>
                   <p className="text-slate-500 text-xs">You get 30s to think about each question.</p>
                 </div>
               </div>
               <div className="flex items-center group">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-4 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-sm">
                   <span className="font-bold text-sm">2</span>
                 </div>
                 <div className="flex-1">
                   <p className="font-semibold text-slate-800">Record Answer</p>
                   <p className="text-slate-500 text-xs">Speak clearly for up to 60s per response.</p>
                 </div>
               </div>
               <div className="flex items-center group">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-4 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-sm">
                   <span className="font-bold text-sm">3</span>
                 </div>
                 <div className="flex-1">
                   <p className="font-semibold text-slate-800">AI Analysis</p>
                   <p className="text-slate-500 text-xs">Get instant feedback on content & delivery.</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-3">
            {browserWarning && (
              <div className="text-amber-700 bg-amber-50 p-4 rounded-xl text-sm border border-amber-100 flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                {browserWarning}
              </div>
            )}
            {cameraError && (
              <div className="text-red-700 bg-red-50 p-4 rounded-xl text-sm border border-red-100 flex items-center">
                 <span className="text-xl mr-3">🚫</span>
                {cameraError}
              </div>
            )}
            
            <button
              onClick={startCamera}
              disabled={isLoadingCamera}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              {isLoadingCamera ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
              Let's Begin
            </button>
            
            <button
              onClick={resetInterview}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
