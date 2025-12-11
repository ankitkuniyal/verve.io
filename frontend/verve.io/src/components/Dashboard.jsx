import React, { useEffect, useState, useCallback } from 'react';
import {
  Brain,
  Video,
  BarChart3,
  Star,
  User,
  LogOut,
  Trophy,
  Target,
  Zap,
  BookOpen,
  ChevronRight,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  X,
  Menu,
  Lightbulb,
  Sparkles,
  Newspaper,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase/config';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

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

// --- Sub-components for Dashboard Structure ---

const SidebarItem = ({ icon: Icon, label, to, active, onClick, collapsed }) => (
  <Link
    to={to}
    onClick={onClick} 
    className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 group relative ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 cover-trigger'
    }`}
    title={collapsed ? label : ''}
  >
    <Icon size={20} className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-200">{label}</span>}
  </Link>
);

const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-extrabold text-slate-900 mb-1">{value}</div>
    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
  </div>
);

const LeagueCard = ({ leagueData }) => {
    const { league, next_league, progress, league_score } = leagueData;
    
    return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl animate-fade-in transition-transform hover:scale-[1.02]">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={120} />
             </div>
             
             <div className="relative z-10 flex items-center justify-between mb-6">
                 <div>
                     <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-1">Current League</h3>
                     <div className="flex items-center space-x-2">
                        <span className="text-3xl">{league.icon}</span>
                        <span className="text-2xl font-bold">{league.name}</span>
                     </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Score</div>
                    <div className="text-2xl font-mono text-cyan-400 font-bold">{Math.round(league_score)}</div>
                 </div>
             </div>

             <div className="relative z-10">
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                    <span>Progress to {next_league?.name}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                    Reach {next_league?.min_score} points to advance and unlock new badges.
                </p>
             </div>
        </div>
    )
}

const NewsWidget = () => {
  const newsItems = [
    {
      id: 1,
      title: "GMAT Focus Edition: What Top B-Schools Are Saying",
      category: "Admissions",
      time: "2h ago",
      trending: true
    },
    {
      id: 2,
      title: "Consulting recruitment trends for MBA Class of 2026",
      category: "Careers",
      time: "5h ago",
      trending: false
    },
    {
      id: 3,
      title: "How to ace the new Wharton video essay prompt",
      category: "Interview Prep",
      time: "1d ago",
      trending: true
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in-up hover:shadow-md transition-shadow">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                 <Newspaper size={18} />
             </div>
             <h3 className="font-bold text-slate-900">Latest Insights</h3>
          </div>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">View All</button>
       </div>

       <div className="space-y-4">
          {newsItems.map((item) => (
             <div key={item.id} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.category}</span>
                   <span className="text-[10px] text-slate-400 flex items-center">
                      <Clock size={10} className="mr-1" /> {item.time}
                   </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">
                   {item.title}
                </h4>
                {item.trending && (
                   <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-medium">
                      <TrendingUp size={10} /> Trending Now
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};

// --- Main Component ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', photoURL: '' });
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    streak: 0,
    improvement: '0%',
  });
  const [leagueData, setLeagueData] = useState({
    league: { name: 'Bronze', icon: '🥉' },
    league_score: 0,
    next_league: { name: 'Silver', min_score: 50 },
    progress: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Desktop sidebar collapse state
  const [isExpanded, setIsExpanded] = useState(false);

  // Authentication & Data Fetching
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch User Profile
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          const data = profileSnap.exists() ? profileSnap.data() : {};
          setUser({
            name: data.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            photoURL: data.photoURL || firebaseUser.photoURL,
            mbaExam: data.mbaExam || 'CAT'
          });
          
          // Trigger data fetch
          await fetchDashboardData(firebaseUser.uid);
        } catch (e) {
          console.error("Profile load error", e);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = useCallback(async (userId) => {
      setIsLoading(true);
      try {
        await new Promise(r => setTimeout(r, 800)); 

        setStats({
            totalQuizzes: 12,
            avgScore: 78,
            streak: 3,
            improvement: '+15%',
            chaptersAttempted: 5,
            weakestTopic: "Quant",
            strongestTopic: "Verbal"
        });

        setLeagueData({
            league: { name: 'Gold', icon: '🥇' },
            league_score: 785,
            next_league: { name: 'Platinum', min_score: 1000 },
            progress: 78
        });

        setChartData({
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Performance',
                    data: [65, 70, 68, 85],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                }
            ]
        });

      } catch (err) {
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  if(!chartData && isLoading) return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full'} 
          lg:translate-x-0 lg:shadow-none flex flex-col
          ${isExpanded ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div 
           className={`p-6 border-b border-slate-100 flex items-center justify-between transition-all duration-300 ${!isExpanded ? 'justify-center px-4' : ''}`}
        >
             <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
                title="Toggle Sidebar"
             >
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Zap size={18} fill="currentColor" />
               </div>
               {isExpanded && (
                  <span className="font-bold text-xl tracking-tight text-slate-900 transition-opacity duration-200">verve.io</span>
               )}
             </div>
             {/* Close button for mobile */}
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
               <X size={20} />
             </button>
        </div>
        
        <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
             {isExpanded && <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-2 whitespace-nowrap">Overview</div>}
             <SidebarItem icon={BarChart3} label="Dashboard" to="/dashboard" active onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             <SidebarItem icon={User} label="My Profile" to="/profile" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             
             {isExpanded && <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6 whitespace-nowrap">Practice</div>}
             <SidebarItem icon={Video} label="Mock Interview" to="/mba-interview" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             <SidebarItem icon={Target} label="AI Quizzes" to="/ai-quiz" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             <SidebarItem icon={BookOpen} label="Essay Coach" to="/essay-writing" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             <SidebarItem icon={MoreHorizontal} label="Resume Analyzer" to="/resume-parser" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
             
             {isExpanded && <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6 whitespace-nowrap">Learning</div>}
             <SidebarItem icon={Brain} label="Knowledge Hub" to="/learning-hub" onClick={() => setIsSidebarOpen(false)} collapsed={!isExpanded} />
        </div>

        <div className="p-4 border-t border-slate-100">
             <button onClick={handleLogout} className={`flex items-center ${!isExpanded ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors group`}>
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                {isExpanded && <span className="font-medium text-sm">Sign Out</span>}
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
         className={`flex-1 p-4 md:p-8 overflow-x-hidden w-full transition-all duration-300
         ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}
         `}
      >
        {/* Top Header Mobile */}
        <div className="lg:hidden flex justify-between items-center mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-sm z-30 py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Zap size={18} fill="currentColor" />
               </div>
               <span className="font-bold text-xl text-slate-900">verve.io</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 active:scale-95 transition-transform"
            >
              <Menu size={24} />
            </button>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
                <p className="text-slate-500 mt-1">Here's what's happening with your prep today.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                 <button className="hidden md:flex items-center bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                    <Calendar size={16} className="mr-2" />
                    Schedule Mock
                 </button>
                 <Link to="/mba-interview" className="flex-1 md:flex-none justify-center flex items-center bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                    Start Practice
                    <Video size={16} className="ml-2" />
                 </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
             {/* Left Column: Stats & Chart */}
             <div className="lg:col-span-2 space-y-8">
                 {/* Quick Stats Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Target} label="Quizzes Taken" value={stats.totalQuizzes} trend="+2 this week" color="bg-blue-500" delay={0} />
                    <StatCard icon={Trophy} label="Avg. Score" value={`${stats.avgScore}%`} trend={stats.improvement} color="bg-purple-500" delay={100} />
                    <StatCard icon={Zap} label="Current Streak" value={`${stats.streak} Days`} color="bg-orange-500" delay={200} />
                    <StatCard icon={Star} label="Skill Level" value="Level 4" color="bg-emerald-500" delay={300} />
                 </div>

                 {/* Focus Mode / Action Cards */}
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <Link to="/mba-interview" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Video size={100} />
                         </div>
                         <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Video size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">Video Interview</h3>
                            <p className="text-slate-500 text-sm mb-4">Practice with AI-generated questions.</p>
                            <span className="text-blue-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">Start Session <ChevronRight size={16} className="ml-1" /></span>
                         </div>
                     </Link>

                     <Link to="/essay-writing" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden animate-fade-in-up" style={{animationDelay: '200ms'}}>
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <BookOpen size={100} />
                         </div>
                         <div className="relative z-10">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">Essay Coach</h3>
                            <p className="text-slate-500 text-sm mb-4">Get instant feedback on your essays.</p>
                            <span className="text-purple-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">Analyze Now <ChevronRight size={16} className="ml-1" /></span>
                         </div>
                     </Link>

                     <Link to="/resume-parser" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden animate-fade-in-up" style={{animationDelay: '300ms'}}>
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <MoreHorizontal size={100} />
                         </div>
                         <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MoreHorizontal size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">Resume Analyzer</h3>
                            <p className="text-slate-500 text-sm mb-4">Optimize your resume with AI.</p>
                            <span className="text-emerald-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">Check Resume <ChevronRight size={16} className="ml-1" /></span>
                         </div>
                     </Link>
                 </div>

                 {/* Chart Section */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up" style={{animationDelay: '400ms'}}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Performance Trends</h3>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                        </select>
                    </div>
                    <div className="h-64 w-full">
                        {chartData && (
                            <Line 
                                data={chartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#f1f5f9' } },
                                        x: { grid: { display: false } }
                                    }
                                }} 
                            />
                        )}
                    </div>
                 </div>
             </div>

             {/* Right Column: League & News */}
             <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '500ms'}}>
                 <LeagueCard leagueData={leagueData} />
                 
                 {/* News Widget - Added below League Card as requested */}
                 <NewsWidget />

                 {/* Daily Wisdom (Consolidated/Simplified if needed, kept for now as it's nice) */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Sparkles size={80} />
                     </div>
                     <div className="flex items-center gap-2 mb-4 relative z-10">
                         <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                              <Lightbulb size={16} />
                         </div>
                         <h3 className="font-bold text-slate-900">Daily Wisdom</h3>
                     </div>
                     <p className="text-slate-600 text-sm leading-relaxed mb-6 italic relative z-10">
                         "When discussing weaknesses, choose a real trait but focus 80% of your answer on how you are actively managing and improving it."
                     </p>
                     <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-4 relative z-10">
                         <span className="font-medium uppercase tracking-wider">Today's Tip</span>
                     </div>
                 </div>

             </div>
        </div>
      </main>
    </div>
  );
}