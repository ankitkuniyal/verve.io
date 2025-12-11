import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight,ArrowLeft, School, GraduationCap, FileText, Loader2, Lock } from 'lucide-react';

export default function InterviewSetup({
  resumeText,
  setResumeText,
  targetSchool,
  setTargetSchool,
  exam,
  setExam,
  isExtracting,
  handleFileChange,
  handleGenerateQuestions,
  isGeneratingQuestions,
  apiError
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 ring-1 ring-slate-100/50">
          <div className="bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <fileText size={120} />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Interview Setup</h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Configure your mock interview session. Upload your resume to let our AI generate personalized questions tailored to your profile.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start animate-fade-in">
                <Lock className="mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-sm">Access Error</h4>
                  <p className="text-sm mt-1">{apiError}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Target School</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <School className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400"
                    placeholder="e.g. Harvard Business School"
                    value={targetSchool}
                    onChange={(e) => setTargetSchool(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Exam / Program</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                  >
                    <option value="CAT">CAT (IIMs)</option>
                    <option value="GMAT">GMAT (International)</option>
                    <option value="GRE">GRE</option>
                    <option value="XAT">XAT</option>
                    <option value="Job Interview">Job Interview</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Resume / Profile</label>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className={`
                    flex flex-col items-center justify-center h-full min-h-[160px]
                    border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                    ${isExtracting 
                      ? 'border-blue-300 bg-blue-50 cursor-wait' 
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-md'
                    }
                  `}>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={isExtracting} />
                    <div className={`p-4 rounded-full mb-3 ${isExtracting ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isExtracting ? <Loader2 className="animate-spin w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600 text-center px-4">
                      {isExtracting ? "Parsing PDF..." : "Upload Resume"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PDF format only</span>
                  </label>
                </div>

                <div className="md:col-span-2 relative">
                  <textarea
                    className="w-full h-full min-h-[160px] p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-600 text-sm leading-relaxed resize-none"
                    placeholder="Or paste your resume text here directly..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={isExtracting}
                  />
                  {resumeText && (
                    <div className="absolute bottom-4 right-4 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Resume Loaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions || !resumeText?.trim()}
                className="
                  w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                  text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/25 
                  transition-all transform hover:-translate-y-0.5 active:translate-y-0
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                  flex items-center justify-center
                "
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="animate-spin mr-3" size={24} />
                    Generating Your Personal Interview...
                  </>
                ) : (
                  <>
                    Start AI Interview Session
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
              <p className="text-center text-slate-400 text-xs mt-4">
                Powered by Gemini AI • Analyzes fit for {targetSchool || "your target school"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
