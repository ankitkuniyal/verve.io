import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Pause, 
  Upload, 
  Brain, 
  Video, 
  FileText, 
  BarChart3, 
  Award, 
  Clock, 
  Shield,
  Users,
  Target,
  Star,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  Zap,
  MessageCircle,
  UserCheck,
  TrendingUp
} from "lucide-react";

// Mock data for charts and statistics
const performanceData = {
  labels: ["Communication", "Confidence", "Content", "Body Language", "Overall"],
  datasets: [
    {
      label: "Your Score",
      data: [75, 68, 82, 60, 72],
      backgroundColor: "rgba(99, 102, 241, 0.8)",
      borderColor: "rgba(99, 102, 241, 1)",
      borderWidth: 2,
    },
    {
      label: "Average Score",
      data: [65, 62, 70, 58, 64],
      backgroundColor: "rgba(156, 163, 175, 0.6)",
      borderColor: "rgba(156, 163, 175, 1)",
      borderWidth: 2,
    },
  ],
};

const improvementData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Performance Score",
      data: [58, 65, 72, 78],
      borderColor: "rgba(16, 185, 129, 1)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
      borderWidth: 4,
    },
  ],
};

// Styled component for action buttons
const ActionButton = ({ text, hoverText, icon, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="relative group flex items-center justify-center w-full min-h-20 rounded-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 ease-out hover:border-gray-800 hover:scale-105"
      style={{ backgroundColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out mix-blend-overlay opacity-20" />
      
      <div className="relative flex items-center justify-center w-full p-4 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full mr-4 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <div className="relative overflow-hidden h-10 flex items-center">
          <span
            className={`absolute text-lg font-bold text-gray-900 transition-all duration-300 ${
              isHovered ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {text}
          </span>
          <span
            className={`absolute text-lg font-bold text-gray-900 transition-all duration-300 ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            {hoverText}
          </span>
        </div>
      </div>
    </button>
  );
};

// Styled component for feature cards
const FeatureCard = ({ icon, title, description, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`p-6 rounded-2xl border-2 border-gray-200 bg-white transition-all duration-700 transform hover:scale-105 hover:shadow-xl ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      }`}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Styled component for trust badges
const TrustBadge = ({ icon, title, description, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`text-center p-8 rounded-2xl border-2 border-gray-200 bg-white transition-all duration-700 transform hover:scale-105 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      }`}
    >
      <div className="flex justify-center mb-4">
        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Scroll to top button
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-gray-800"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

// Video interview simulator component
const VideoInterviewSimulator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState(30);
  const [answerTime, setAnswerTime] = useState(60);
  const [currentStep, setCurrentStep] = useState("ready"); // ready, preparing, answering, completed

  useEffect(() => {
    let timer;
    if (currentStep === "preparing" && prepTime > 0) {
      timer = setInterval(() => {
        setPrepTime((time) => time - 1);
      }, 1000);
    } else if (currentStep === "preparing" && prepTime === 0) {
      setCurrentStep("answering");
    } else if (currentStep === "answering" && answerTime > 0) {
      timer = setInterval(() => {
        setAnswerTime((time) => time - 1);
      }, 1000);
    } else if (currentStep === "answering" && answerTime === 0) {
      setCurrentStep("completed");
    }

    return () => clearInterval(timer);
  }, [currentStep, prepTime, answerTime]);

  const startInterview = () => {
    setCurrentStep("preparing");
    setPrepTime(30);
    setAnswerTime(60);
  };

  const resetInterview = () => {
    setCurrentStep("ready");
    setPrepTime(30);
    setAnswerTime(60);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Try Our Interview Simulator
      </h3>
      
      <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center">
        {currentStep === "ready" && (
          <div className="text-center text-white">
            <Video size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Click start to begin mock interview</p>
          </div>
        )}
        
        {(currentStep === "preparing" || currentStep === "answering") && (
          <>
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {isRecording ? "REC" : "LIVE"}
            </div>
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentStep === "preparing" ? `Prep: ${prepTime}s` : `Answer: ${answerTime}s`}
            </div>
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                <UserCheck size={32} className="text-white" />
              </div>
            </div>
          </>
        )}
        
        {currentStep === "completed" && (
          <div className="text-center text-white">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
            <p className="text-lg">Response recorded! Analyzing your performance...</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentStep === "ready" && (
          <button
            onClick={startInterview}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105"
          >
            Start Practice Interview
          </button>
        )}
        
        {currentStep === "preparing" && (
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl mb-4">
              <p className="font-bold">Preparation Time</p>
              <p className="text-2xl font-bold">{prepTime} seconds remaining</p>
              <p className="text-sm mt-2">Think about your answer before recording</p>
            </div>
          </div>
        )}
        
        {currentStep === "answering" && (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl mb-4">
              <p className="font-bold">Recording Your Answer</p>
              <p className="text-2xl font-bold">{answerTime} seconds remaining</p>
              <p className="text-sm mt-2">Speak clearly and confidently</p>
            </div>
            <button
              onClick={() => setCurrentStep("completed")}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-red-700 hover:scale-105"
            >
              Stop Recording
            </button>
          </div>
        )}
        
        {currentStep === "completed" && (
          <div className="space-y-3">
            <button
              onClick={resetInterview}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105"
            >
              Try Another Question
            </button>
            <button className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:border-gray-800 hover:scale-105">
              View Detailed Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const navigate = useNavigate();

  const interviewQuotes = [
    "Your path to MBA admission success",
    "AI-powered interview preparation",
    "Personalized feedback for every response",
    "Practice with confidence, perform with excellence",
    "From preparation to admission",
    "Smart interviews for smarter candidates",
    "Your competitive edge in MBA admissions",
    "Real-time feedback, real results"
  ];

  useEffect(() => {
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 100);

    const quoteTimer = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % interviewQuotes.length);
        setQuoteFade(true);
      }, 200);
    }, 4000);

    return () => {
      clearTimeout(titleTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleTryDemo = () => {
    // Scroll to demo section
    document.getElementById("demo-section").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Text Ticker */}
      <div className="fixed top-0 left-0 w-full overflow-hidden z-50 bg-gray-900 py-3">
        <div className="flex whitespace-nowrap text-white font-mono font-bold text-sm uppercase">
          <div className="animate-marquee flex">
            <span className="px-8">• 90% OF TOP MBA CANDIDATES PRACTICE WITH MOCK INTERVIEWS •</span>
            <span className="px-8">• AI-POWERED PERSONALIZED FEEDBACK •</span>
            <span className="px-8">• INSTANT PERFORMANCE ANALYSIS •</span>
            <span className="px-8">• RESUME-BASED CUSTOM QUESTIONS •</span>
            <span className="px-8">• 90% OF TOP MBA CANDIDATES PRACTICE WITH MOCK INTERVIEWS •</span>
            <span className="px-8">• AI-POWERED PERSONALIZED FEEDBACK •</span>
            <span className="px-8">• INSTANT PERFORMANCE ANALYSIS •</span>
            <span className="px-8">• RESUME-BASED CUSTOM QUESTIONS •</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col items-center pt-32 pb-16 px-4">
        <div className="text-center max-w-7xl w-full">
          {/* Main Title */}
          <h1
            className="font-bold leading-none select-none text-center mb-8"
            style={{
              fontSize: "clamp(4rem, 15vw, 12rem)",
              color: "#1f2937",
              margin: 0,
              padding: 0,
              lineHeight: 0.9,
            }}
          >
            {"verve.io".split("").map((letter, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-700 ease-out ${
                  showTitle
                    ? "opacity-100 transform translate-y-0 scale-100"
                    : "opacity-0 transform translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: showTitle ? `${index * 0.05}s` : "0s",
                }}
              >
                {letter}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <div
            className={`transition-opacity duration-700 delay-1000 ${
              showTitle ? "opacity-100" : "opacity-0"
            }`}
          >
            <h2
              className="text-4xl md:text-4xl font-bold text-gray-800 mb-8 mt-10"
              style={{ fontFamily: "Georgia, serif" }}
            >
            Unlock your potential. Transform how you learn, practice, and master your MBA interview.
            </h2>
          </div>

          {/* Quotes */}
          <div
            className={`mt-8 transition-opacity duration-700 delay-1200 ${
              showTitle ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative overflow-visible mx-auto max-w-4xl min-h-20 flex items-center justify-center">
              <div
                className={`text-center transition-opacity duration-500 ease-in-out flex items-center justify-center ${
                  quoteFade ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                  color: "#4b5563",
                  fontWeight: "500",
                  padding: "0 1rem",
                  whiteSpace: "normal",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                <Star className="w-6 h-6 mr-3 text-yellow-500 flex-shrink-0" />
                {interviewQuotes[currentQuoteIndex]}
                <Star className="w-6 h-6 ml-3 text-yellow-500 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`mt-12 mb-16 transition-opacity duration-700 delay-1500 ${
              showTitle ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <ActionButton
                text="Upload Resume"
                hoverText="Get Started"
                color="#dbeafe"
                icon={<Upload size={24} />}
                onClick={handleGetStarted}
              />
              <ActionButton
                text="Try Demo"
                hoverText="Practice Now"
                color="#fef3c7"
                icon={<Play size={24} />}
                onClick={handleTryDemo}
              />
              <ActionButton
                text="View Analysis"
                hoverText="See Results"
                color="#dcfce7"
                icon={<BarChart3 size={24} />}
                onClick={() => document.getElementById("features-section").scrollIntoView({ behavior: "smooth" })}
              />
            </div>
          </div>

          {/* Features Section */}
          <div id="features-section" className="mt-20 py-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 text-center">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Our AI-powered platform transforms your MBA interview preparation with personalized, data-driven insights
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <FeatureCard
                icon={<Upload size={32} />}
                title="Upload Your Profile"
                description="Submit your resume, essays, and application materials for personalized question generation"
                delay={200}
              />
              <FeatureCard
                icon={<Brain size={32} />}
                title="AI Question Generation"
                description="Get custom behavioral, situational, and school-specific questions based on your background"
                delay={400}
              />
              <FeatureCard
                icon={<Video size={32} />}
                title="Practice Interviews"
                description="Record your responses with realistic interview simulation and timed preparation"
                delay={600}
              />
              <FeatureCard
                icon={<BarChart3 size={32} />}
                title="Instant Feedback"
                description="Receive comprehensive analysis of your verbal and non-verbal communication skills"
                delay={800}
              />
            </div>
          </div>

          {/* Demo Section */}
          <div id="demo-section" className="mt-20 py-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold text-gray-900 mb-4 text-center">
                Experience the Future of Interview Prep
              </h2>
              <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
                Try our interactive interview simulator to see how AI can transform your preparation
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <VideoInterviewSimulator />
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Sample MBA Interview Question</h4>
                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <p className="text-lg text-gray-700 italic">
                        "Describe a time when you had to lead a team through a significant challenge. What was your approach, and what did you learn about leadership from this experience?"
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">Preparation: 30 seconds • Answer: 1 minute</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                    <h4 className="text-xl font-bold mb-4">What Our AI Analyzes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Communication Clarity</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Confidence Level</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Content Structure</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Body Language</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Answer Relevance</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-3" />
                        <span>Time Management</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges Section */}
          <div className="mt-20 py-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl font-bold text-gray-900 mb-4 text-center">
                Why Choose InterviewAI?
              </h2>
              <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
                Join thousands of successful MBA candidates who transformed their interview skills with our platform
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <TrustBadge
                  icon={<Zap size={32} />}
                  title="Instant Feedback"
                  description="Get real-time analysis of your performance with actionable improvement suggestions"
                  delay={100}
                />
                <TrustBadge
                  icon={<Shield size={32} />}
                  title="Personalized Questions"
                  description="Questions tailored to your specific background, goals, and target schools"
                  delay={200}
                />
                <TrustBadge
                  icon={<TrendingUp size={32} />}
                  title="Progress Tracking"
                  description="Monitor your improvement over time with detailed analytics and progress reports"
                  delay={300}
                />
                <TrustBadge
                  icon={<Users size={32} />}
                  title="Expert Designed"
                  description="Built with insights from MBA admissions consultants and industry experts"
                  delay={400}
                />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 py-16 bg-white rounded-3xl shadow-xl">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-5xl font-bold text-gray-900 mb-12 text-center">
                Proven Results
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">94%</div>
                  <div className="text-gray-600">Success Rate</div>
                  <div className="text-sm text-gray-500 mt-1">Users feel more confident</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">2.3x</div>
                  <div className="text-gray-600">Improvement</div>
                  <div className="text-sm text-gray-500 mt-1">Faster skill development</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
                  <div className="text-gray-600">Business Schools</div>
                  <div className="text-sm text-gray-500 mt-1">School-specific questions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">10k+</div>
                  <div className="text-gray-600">Practice Sessions</div>
                  <div className="text-sm text-gray-500 mt-1">Completed monthly</div>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Ace Your MBA Interview?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Join thousands of successful candidates who transformed their interview skills with AI-powered coaching
                </p>
                <button
                  onClick={handleGetStarted}
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-flex items-center"
                >
                  Start Your Journey Today
                  <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Sign Up Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={handleGetStarted}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center"
        >
          <UserCheck size={20} className="mr-2" />
          Get Started
        </button>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default LandingPage;