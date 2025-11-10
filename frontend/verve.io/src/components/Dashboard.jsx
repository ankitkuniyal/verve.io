import React, { useEffect, useRef, useState } from 'react';
import { 
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
  TrendingUp,
  Download,
  LogOut,
  Settings,
  Calendar,
  Lightbulb,
  Trophy,
  ChartLine,
  TargetIcon,
  PieChart,
  Newspaper,
  PenTool,
  FileUp
} from 'lucide-react';

// Import Chart.js properly
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Import useNavigate for redirect
import { useNavigate } from 'react-router-dom';

// Firebase logout
import { getAuth, signOut } from 'firebase/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const tips = [
  'Consistency beats intensity.',
  'Every day is a new opportunity to learn.',
  'Small steps every day lead to big results.',
  'Mistakes are proof that you are trying.',
  'Stay curious and keep exploring.',
];

function getTipOfTheDay() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = dateSeed % tips.length;
  return tips[index];
}

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
const FeatureCard = ({ icon, title, description, delay, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 border-gray-200 bg-white transition-all duration-700 transform hover:scale-105 hover:shadow-xl cursor-pointer ${
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

export default function Dashboard() {
  const [user] = useState({ 
    name: 'Aaryan', 
    email: 'aaryan@email.com', 
    mbaExam: 'CAT' 
  });
  const [profileEdit, setProfileEdit] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const tipOfTheDay = getTipOfTheDay();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Add useNavigate for redirecting
  const navigate = useNavigate();

  // Hardcoded stats
  const stats = {
    totalQuizzes: 45,
    avgScore: 78,
    chaptersAttempted: 12,
    streak: 7,
    weeklyTarget: 10,
    improvement: '+12%',
    weakestTopic: 'Quantitative Aptitude',
    strongestTopic: 'Verbal Ability'
  };

  const leagueData = {
    league: { 
      name: 'Silver', 
      icon: '🥈',
      color: '#94a3b8'
    },
    league_score: 78,
    next_league: { 
      name: 'Gold', 
      min_score: 85 
    },
    progress: 65
  };

  const recommendations = [
    {
      id: 1,
      title: 'Master Time Management',
      description: 'You spend avg 3.2 mins per question. Aim for 2.5 mins to complete sections faster.',
      icon: <Clock size={24} />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'Practice Mental Math',
      description: 'Avoid calculator dependency. Practice speed calculations for Quant section.',
      icon: <Brain size={24} />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Revision Strategy Needed',
      description: 'Revisit incorrect answers. Your revision rate is 40% - increase to 70%.',
      icon: <TrendingUp size={24} />,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const mbaNews = [
    {
      id: 1,
      title: 'IIM CAT 2025 Registration Extended',
      description: 'Last date to register extended to Nov 20th. Don\'t miss out!',
      date: 'Nov 8, 2025',
      badge: 'Important'
    },
    {
      id: 2,
      title: 'New Pattern Alert: XAT 2026',
      description: 'Decision Making section weightage increased by 10%.',
      date: 'Nov 5, 2025',
      badge: 'Update'
    },
    {
      id: 3,
      title: 'Top B-Schools Placement Stats',
      description: 'IIM A, B, C report 100% placements with avg package ₹32 LPA.',
      date: 'Nov 3, 2025',
      badge: 'News'
    }
  ];

  // Chart data configuration
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    datasets: [
      {
        label: 'Quantitative Aptitude',
        data: [62, 65, 68, 72, 70, 75, 78, 76, 80, 82, 85, 87],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Verbal Ability',
        data: [70, 72, 75, 73, 78, 80, 82, 85, 83, 86, 88, 90],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'LRDI',
        data: [58, 60, 63, 65, 68, 70, 72, 75, 77, 79, 81, 83],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0ea5e9',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: { 
        beginAtZero: true,
        max: 100,
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => value + '%'
        }
      }
    }
  };

  useEffect(() => {
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 100);

    return () => clearTimeout(titleTimer);
  }, []);

  const handleLogout = async () => {
    // Properly logout Firebase user and clear all storage
    try {
      const auth = getAuth();
      await signOut(auth);
      // Clear all localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Optionally redirect to login or homepage
      window.location.href = '/'; // adjust this to your application's route
      console.log('Successfully logged out and cleared storage');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const downloadReport = async () => {
    // Download report implementation remains the same
    console.log('Download report clicked');
    // Add your actual download logic here
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
                {"Welcome back, Aaryan!!".split(/( )/).map((part, index) =>
                  part === " " ? (
                    <span key={index}>&nbsp;</span>
                  ) : (
                    part.split("").map((letter, i) => (
                      <span
                        key={`${index}-${i}`}
                        className={`inline-block transition-all duration-700 ease-out ${
                          showTitle
                            ? "opacity-100 transform translate-y-0 scale-100"
                            : "opacity-0 transform translate-y-12 scale-95"
                        }`}
                        style={{
                          transitionDelay: showTitle
                            ? `${(index * 7 + i) * 0.05}s`
                            : "0s",
                        }}
                      >
                        {letter}
                      </span>
                    ))
                  )
                )}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">Ready to continue your MBA preparation journey?</p>

              {/* Tip of the Day */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-2xl p-6 flex items-center gap-4 shadow-sm mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Tip of the Day:</div>
                  <div className="text-sm text-yellow-700">{tipOfTheDay}</div>
                </div>
              </div>

              <div className="text-gray-500 flex items-center gap-2">
                <Calendar size={18} />
                {currentDate}
              </div>
            </div>

            {/* User Profile Card */}
            <div className="w-full lg:w-80">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                    <UserCheck size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-xl">{user.name}</div>
                    <div className="text-base text-gray-500">{user.email}</div>
                    <div className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {user.mbaExam} Aspirant
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setProfileEdit(true)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <FeatureCard
            icon={<FileUp size={32} />}
            title="Resume Parser"
            description="AI-Powered Analysis of your resume and background"
            delay={200}
            onClick={() => window.location.href = '/resume-parser'}
          />
          <FeatureCard
            icon={<Brain size={32} />}
            title="AI Quiz"
            description="Interactive Learning with personalized questions"
            delay={300}
            onClick={() => window.location.href = '/ai-quiz'}
          />
          <FeatureCard
            icon={<PenTool size={32} />}
            title="Written Test"
            description="Essay Practice and analysis"
            delay={400}
            onClick={() => window.location.href = '/essay-writing'}
          />
          <FeatureCard
            icon={<Video size={32} />}
            title="Video Interview"
            description="Practice Interviews with AI feedback"
            delay={500}
            onClick={() => window.location.href = '/mba-interview'}
          />
        </div>

        {/* Progress Trend + League & Reports */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-2">
                  <ChartLine className="text-blue-600" size={24} />
                  Section-wise Progress Trend
                </h5>
                <p className="text-gray-600">Performance across Quant, Verbal, and LRDI over 12 weeks</p>
              </div>
              <button 
                onClick={downloadReport}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Download Report
              </button>
            </div>
            
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="space-y-6">
            {/* League Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
                <Trophy className="text-amber-500" size={24} />
                Your League
              </h5>
              <div className="p-5 rounded-xl bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl border-2 border-white/30">
                    {leagueData.league.icon}
                  </div>
                  <div>
                    <div className="font-bold text-2xl">{leagueData.league.name} League</div>
                    <div className="text-sm opacity-90 flex items-center gap-1">
                      <Star size={16} />
                      {Math.floor(leagueData.league_score)}% League Score
                    </div>
                  </div>
                </div>

                <div className="relative bg-white/15 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Next: {leagueData.next_league.name} League</span>
                    <span>{leagueData.next_league.min_score}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800/40 rounded-full overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${leagueData.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs opacity-90">{leagueData.progress}% Complete</div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {leagueData.next_league.min_score - leagueData.league_score}% to go
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
                <BarChart3 className="text-blue-600" size={24} />
                Quick Stats
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Improvement</span>
                  <span className="text-lg font-bold text-green-600">{stats.improvement}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Current Streak</span>
                  <span className="text-lg font-bold text-green-600">{stats.streak} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Quizzes</span>
                  <span className="text-lg font-bold text-amber-600">{stats.totalQuizzes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Main Character: Navigation Button (Learning Hub) */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-2xl border-4 border-blue-700 flex flex-col items-center justify-center min-h-[340px] p-0">
            <button
              className="flex flex-col items-center justify-center w-full h-full py-10 bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-2xl shadow-2xl group border-b-4 border-blue-900"
              style={{ minHeight: 240 }}
              onClick={() => navigate('/learning-hub')}
              type="button"
              aria-label="Go to Learning Hub"
            >
              <span className="flex items-center gap-3 mb-5">
                <ArrowRight size={48} className="text-white drop-shadow-lg group-hover:translate-x-2 transition-all duration-300" />
                <span className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">
                  Go to Learning Hub
                </span>
              </span>
              <span className="text-lg text-white/90 font-semibold">Jump into learning. Your personalized resource hub.</span>
              <span className="mt-6 flex flex-col items-center w-full gap-2">
                {/* Sub-titles for context */}
                <span className="text-white/70 text-base flex items-center gap-2">
                  <TargetIcon className="text-red-300" size={18} />
                  Improve your <span className="font-bold ml-1">{stats.weakestTopic}</span>
                </span>
                <span className="text-xs text-white/60 mt-1">Focus on this area for better results</span>
                <span className="text-white/70 text-base flex items-center gap-2 mt-3">
                  <Star className="text-green-300" size={18} />
                  Keep up your strength in <span className="font-bold ml-1">{stats.strongestTopic}</span>
                </span>
                <span className="text-xs text-white/60 mt-1">Keep up the excellent work!</span>
              </span>
            </button>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
              <PieChart className="text-purple-600" size={24} />
              Weekly Progress
            </h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Quizzes This Week</span>
                  <span className="font-bold text-gray-800">{stats.streak}/{stats.weeklyTarget}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${(stats.streak / stats.weeklyTarget) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-xs font-semibold text-blue-700 mb-2">STUDY TIME THIS WEEK</div>
                <div className="text-2xl font-bold text-blue-900">12.5 hrs</div>
                <div className="text-xs text-blue-600 mt-1">+2.5 hrs from last week</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgScore}%</div>
                  <div className="text-xs text-gray-600 mt-1">Avg Score</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.chaptersAttempted}</div>
                  <div className="text-xs text-gray-600 mt-1">Chapters</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={24} />
                Personalized Recommendations
              </h5>
              <p className="text-gray-600 mt-1">Based on your recent performance</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <div key={rec.id} className="group p-6 rounded-xl bg-gradient-to-br hover:shadow-lg transition-all border border-gray-200 hover:scale-105 duration-300 cursor-pointer">
                <div className={`w-12 h-12 bg-gradient-to-br ${rec.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {rec.icon}
                </div>
                <div className="font-bold text-gray-800 mb-2">{rec.title}</div>
                <div className="text-sm text-gray-600">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MBA News & Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2">
              <Newspaper className="text-blue-600" size={24} />
              MBA News & Updates
            </h5>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Latest</span>
          </div>
          <div className="space-y-4">
            {mbaNews.map(news => (
              <div key={news.id} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-gray-800">{news.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      news.badge === 'Important' ? 'bg-red-100 text-red-700' :
                      news.badge === 'Update' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {news.badge}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{news.description}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {news.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {profileEdit && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setProfileEdit(false)}
          />
          <div className="fixed inset-x-4 top-20 md:inset-x-1/4 z-50 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Profile Settings</h3>
                  <button 
                    onClick={() => setProfileEdit(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input 
                      value={user.name} 
                      className="w-full bg-white border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email"
                      value={user.email}
                      className="w-full bg-white border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Exam</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['CAT', 'XAT', 'CMAT', 'NMAT', 'MAT', 'ATMA'].map((exam) => (
                        <button
                          key={exam}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${user.mbaExam === exam 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {exam}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setProfileEdit(false)} 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setProfileEdit(false)} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}