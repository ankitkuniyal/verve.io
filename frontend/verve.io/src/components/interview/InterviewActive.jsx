import React from 'react';
import { Square, Video, Mic } from 'lucide-react';

export default function InterviewActive({
  stage,
  currentQuestionIndex,
  totalQuestions,
  currentQuestion,
  recordTimeLeft,
  prepTimeLeft,
  skipPrepTimer,
  transcript,
  videoRef,
  stopRecording
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header Bar */}
      <div className="h-16 border-b border-white/10 flex justify-between items-center px-4 md:px-6 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex flex-col w-full max-w-xs">
             <div className="flex justify-between items-baseline mb-1">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Question {currentQuestionIndex + 1}/{totalQuestions}</span>
                <span className="text-xs text-slate-500 font-medium truncate ml-2 hidden sm:inline-block">{currentQuestion?.category}</span>
             </div>
             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
             </div>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          {stage === 'recording' ? (
            <div className="flex items-center space-x-2 md:space-x-3 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </div>
              <span className="text-red-400 font-mono font-bold tracking-widest text-sm">{formatTime(recordTimeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center text-slate-400 text-xs md:text-sm bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
               <span className="text-yellow-400 font-bold">Preparation</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* Left Panel: Question & Info */}
        <div className="flex-1 md:w-5/12 lg:w-1/3 flex flex-col bg-slate-900/50 relative z-10 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-6 pb-32 md:pb-8">
            {/* Question Card */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed text-white/95">
                {currentQuestion?.question}
              </h3>
              
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 flex items-start">
                <span className="text-xl mr-3">💡</span>
                <div className="text-sm text-blue-200 leading-relaxed">
                  <span className="font-bold text-blue-100 block mb-1">Coach Tip</span>
                  {currentQuestion?.tips}
                </div>
              </div>
            </div>

            {/* Preparation Timer Display (Mobile & Desktop) */}
            {stage === 'preparing' && (
              <div className="flex flex-col items-center justify-center bg-yellow-500/5 rounded-2xl border border-yellow-500/10 p-6 md:p-8 relative overflow-hidden mt-4">
                 <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
                 <p className="text-yellow-200/80 text-xs uppercase tracking-[0.2em] font-bold z-10 mb-2">Preparation Time</p>
                 <div className="text-5xl md:text-7xl font-bold text-yellow-500 font-mono z-10 tracking-tighter drop-shadow-lg">
                   00:{prepTimeLeft.toString().padStart(2, '0')}
                 </div>
                 <button
                  onClick={skipPrepTimer}
                  className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all border border-white/5 z-10 flex items-center gap-2 group"
                >
                  <Video size={14} className="group-hover:text-red-400 transition-colors" />
                  Skip & Start Recording
                </button>
              </div>
            )}

            {/* Live Transcript Display */}
            {stage === 'recording' && (
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mt-4">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 flex items-center">
                   <Mic size={12} className="mr-2 text-green-500" />
                   Live Transcript
                </p>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 text-sm md:text-base text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                   {transcript || <span className="text-slate-600 italic">Listening...</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Camera Feed */}
        {/* On mobile: Fixed at bottom, draggable or minimized. On Desktop: Right side 2/3 */}
        <div className={`
          md:relative md:w-7/12 lg:w-2/3 md:h-full
          fixed bottom-0 left-0 right-0 h-48 md:h-auto 
          bg-black border-t md:border-t-0 md:border-l border-white/10 
          shadow-2xl md:shadow-none z-20 flex-shrink-0
        `}>
          <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Camera View */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform scale-x-[-1]"
              autoPlay
              muted
              playsInline
            />
            
            {/* Desktop Overlay Gradient */}
            <div className="hidden md:block absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

            {/* Recording Controls */}
            {stage === 'recording' && (
              <div className="absolute bottom-4 md:bottom-8 w-full flex justify-center items-center z-30 pointer-events-none">
                 <button
                  onClick={stopRecording}
                  className="pointer-events-auto group relative flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-full flex items-center justify-center shadow-xl border-4 border-black/50">
                    <Square className="fill-white" size={24} />
                  </div>
                  <span className="absolute top-full mt-2 text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded">Stop Recording</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
