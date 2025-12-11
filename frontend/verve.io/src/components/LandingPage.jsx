import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Upload, 
  Brain, 
  Video, 
  BarChart3, 
  CheckCircle, 
  Zap, 
  Shield,
  Users,
  ArrowRight,
  TrendingUp,
  Award,
  Star,
  Sparkles
} from "lucide-react";

// Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// --- Components ---

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={20} fill="currentColor" />
           </div>
           <span className="text-2xl font-bold text-slate-900 tracking-tight">verve.io</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
           {['Features', 'How it Works', 'Success Stories'].map((item) => (
             <a 
               key={item} 
               href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
               className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group"
             >
               {item}
               <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
             </a>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/login')}
             className="text-slate-600 font-semibold text-sm hover:text-indigo-600 transition-colors"
           >
             Log in
           </button>
           <button 
             onClick={() => navigate('/register')}
             className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
           >
             Get Started
           </button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 hover:bg-indigo-100 transition-colors cursor-default"
          >
             🚀 The Future of Interview Prep
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tight drop-shadow-sm">
             Master Your MBA Interview <br className="hidden md:block"/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
               With AI Precision
             </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
             Unlock your potential with real-time AI feedback on confidence, clarity, and content. 
             Join thousands of candidates getting into top b-schools.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/register')}
               className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
             >
                Start Free Trial
                <ArrowRight size={20} />
             </motion.button>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
             >
                <Play size={20} className="fill-current" />
                Watch Demo
             </motion.button>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto">
             <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by candidates from</p>
             <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-slate-400 grayscale opacity-60 hover:opacity-100 transition-opacity duration-500">
                <span className="font-serif text-2xl font-bold">Harvard</span>
                <span className="font-serif text-2xl font-bold">Stanford</span>
                <span className="font-serif text-2xl font-bold">Wharton</span>
                <span className="font-serif text-2xl font-bold">INSEAD</span>
                <span className="font-serif text-2xl font-bold">LBS</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group h-full"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150`}></div>
    
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg transform transition-transform group-hover:rotate-6`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    {
       icon: Brain,
       title: "AI Question Generation",
       description: "Custom behavioral questions generated from your resume and target program profile.",
       color: "from-blue-500 to-indigo-600"
    },
    {
       icon: Video,
       title: "Real-time Analysis",
       description: "Get instant feedback on your speaking pace, eye contact, and emotional sentiment.",
       color: "from-purple-500 to-pink-600"
    },
    {
       icon: Upload,
       title: "Resume Parser",
       description: "Upload your CV to uncover hidden gaps and get tailored improvement suggestions.",
       color: "from-amber-400 to-orange-500"
    },
    {
       icon: TrendingUp,
       title: "Progress Tracking",
       description: "Visualize your improvement over time with detailed analytics and performance charts.",
       color: "from-emerald-400 to-teal-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 relative">
       <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to accept that offer</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Comprehensive tools designed by industry experts to give you the competitive edge in your admissions journey.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {features.map((f, i) => (
               <FeatureCard key={i} {...f} delay={i * 0.1} />
             ))}
          </div>
       </div>
    </section>
  );
};

// Simplified Simulator for visual appeal
const MiniSimulator = () => {
  const [step, setStep] = useState(0); // 0: Idle, 1: Countdown, 2: Recording
  
  useEffect(() => {
     const interval = setInterval(() => {
        setStep(prev => (prev + 1) % 3);
     }, 3500);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-slate-900/10 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
       {/* Mock Browser Header */}
       <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 select-none">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="ml-4 bg-slate-700/50 px-3 py-1 rounded-md text-xs text-slate-400 flex-1 text-center font-mono truncate">
            https://verve.io/interview/active
          </div>
       </div>
       
       <div className="relative aspect-video bg-slate-950 flex flex-col md:flex-row">
          <div className="flex-1 p-8 flex flex-col justify-center border-r border-slate-800 relative overflow-hidden">
             
             {/* Dynamic State Overlay */}
             <div className="absolute top-4 left-4">
                {step === 0 && <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Waiting...</span>}
                {step === 1 && <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">Preparing...</span>}
                {step === 2 && (
                    <div className="inline-flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                         <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Live Analysis</span>
                    </div>
                )}
             </div>

             <h3 className="text-xl md:text-2xl text-white font-medium mb-6 leading-snug relative z-10">
               "Tell me about a time you led a team through a significant crisis."
             </h3>
             
             <div className="space-y-4 relative z-10 bg-slate-900/50 p-4 rounded-xl backdrop-blur-sm border border-slate-800">
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Clarity</span>
                    <span className="text-blue-400">High</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full">
                    <motion.div 
                      animate={{ width: ["10%", "60%", "40%", "85%"] }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-blue-500"
                    />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Confidence</span>
                    <span className="text-purple-400">88/100</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full">
                    <motion.div 
                      animate={{ width: ["80%", "88%", "85%", "90%"] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full bg-purple-500"
                    />
                 </div>
               </div>
             </div>
          </div>
          
          <div className="w-1/3 bg-slate-900 relative hidden md:block">
             {/* Fake Person Placeholder */}
             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
                   <Users size={32} className="text-slate-500" />
                </div>
             </div>
             
             {/* AI Overlay Bubble */}
             <AnimatePresence mode="wait">
               {step === 2 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg"
                 >
                    <div className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                          <CheckCircle size={14} />
                       </div>
                       <div>
                          <p className="text-xs text-green-200 font-bold mb-0.5">Great Eye Contact!</p>
                          <p className="text-[10px] text-slate-400 leading-tight">You're engaging well with the camera.</p>
                       </div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
};

const DemoSection = () => (
   <section id="demo-section" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
                   <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Live Demo</span>
                   </div>
                   <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Real-time coaching right in your browser</h2>
                   <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                      Our advanced AI monitors your verbal and non-verbal cues as you speak, providing instant nudges to improve your delivery on the fly. No downloads required.
                   </p>
                   <ul className="space-y-4 mb-8">
                      {[
                        "Live Speech Rate Monitoring",
                        "Filler Word Detection (um, ah, like)",
                        "Sentiment & Tone Analysis",
                        "Eye Contact Tracking"
                      ].map((item, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100"
                        >
                           <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                              <CheckCircle size={14} />
                           </div>
                           <span className="font-medium">{item}</span>
                        </motion.li>
                      ))}
                   </ul>
               </motion.div>
            </div>
            <div className="lg:w-1/2 w-full">
               <MiniSimulator />
            </div>
         </div>
      </div>
   </section>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
       <Navbar />
       <HeroSection />
       <FeaturesSection />
       <DemoSection />
       
       {/* CTA Section */}
       <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10"></div>
          {/* Animated background particles effect could go here */}
          <div className="relative max-w-4xl mx-auto px-6 text-center">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight"
             >
               Ready to transform your interview skills?
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
             >
                Join thousands of students who have secured offers from Harvard, Stanford, and Wharton.
             </motion.p>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-500/20"
               onClick={() => window.location.href = '/#/register'} // Hash router handling
             >
                Get Started for Free
             </motion.button>
             <p className="mt-8 text-sm text-slate-500 font-medium">No credit card required • Cancel anytime</p>
          </div>
       </section>

       {/* Footer */}
       <footer className="bg-slate-950 py-12 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
             <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="font-bold text-slate-200">verve.io</span>
                <span className="border-l border-slate-800 pl-2 ml-2">© 2024 All rights reserved</span>
             </div>
             <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact Support</a>
             </div>
          </div>
       </footer>
    </div>
  );
};

export default LandingPage;