import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

export default function Dashboard() {
  const canvasRef = useRef(null);
  const [user] = useState({ 
    name: 'Aaryan', 
    email: 'aaryan@email.com', 
    mbaExam: 'CAT' 
  });
  const [profileEdit, setProfileEdit] = useState(false);

  const tipOfTheDay = getTipOfTheDay();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
      icon: 'fa-medal',
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
      icon: 'fa-clock',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'Practice Mental Math',
      description: 'Avoid calculator dependency. Practice speed calculations for Quant section.',
      icon: 'fa-calculator',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Revision Strategy Needed',
      description: 'Revisit incorrect answers. Your revision rate is 40% - increase to 70%.',
      icon: 'fa-redo',
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

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (canvasRef.current._chart) {
        canvasRef.current._chart.destroy();
      }

      // Hardcoded graph data - MBA quiz performance
      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'];
      const quantData = [62, 65, 68, 72, 70, 75, 78, 76, 80, 82, 85, 87];
      const verbalData = [70, 72, 75, 73, 78, 80, 82, 85, 83, 86, 88, 90];
      const lrdiData = [58, 60, 63, 65, 68, 70, 72, 75, 77, 79, 81, 83];

      canvasRef.current._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Quantitative Aptitude',
              data: quantData,
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
              data: verbalData,
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
              data: lrdiData,
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
        },
        options: {
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
                callback: (v) => v + '%'
              }
            }
          }
        }
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const downloadReport = async () => {
  try {
    // Get the chart element
    const chartElement = canvasRef.current;
    
    if (!chartElement) {
      alert('Chart not found!');
      return;
    }

    // Create a temporary container for the report
    const reportContainer = document.createElement('div');
    reportContainer.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      width: 800px;
      padding: 20px;
      background: white;
      z-index: 10000;
    `;

    // Create report content
    reportContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          <h1 style="color: #1e293b; margin: 0;">Performance Report</h1>
          <p style="color: #64748b; margin: 5px 0;">Generated on ${new Date().toLocaleDateString()}</p>
          <p style="color: #64748b; margin: 0;">Student: ${user.name} | Target Exam: ${user.mbaExam}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #334155; border-left: 4px solid #3b82f6; padding-left: 10px;">Progress Overview</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: 5px;">
              <strong>Total Quizzes:</strong> ${stats.totalQuizzes}
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 5px;">
              <strong>Average Score:</strong> ${stats.avgScore}%
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 5px;">
              <strong>Current Streak:</strong> ${stats.streak} days
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 5px;">
              <strong>Improvement:</strong> ${stats.improvement}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #334155; border-left: 4px solid #10b981; padding-left: 10px;">Performance Insights</h2>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <strong>Strongest Topic:</strong> ${stats.strongestTopic}
          </div>
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <strong>Area for Improvement:</strong> ${stats.weakestTopic}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
          Report generated by MBA Prep Platform
        </div>
      </div>
    `;

    // Add the chart image
    const chartCanvas = await html2canvas(chartElement);
    const chartImage = chartCanvas.toDataURL('image/png');
    
    const chartImg = document.createElement('img');
    chartImg.src = chartImage;
    chartImg.style.width = '100%';
    chartImg.style.marginTop = '20px';
    chartImg.style.border = '1px solid #e2e8f0';
    chartImg.style.borderRadius = '5px';
    
    reportContainer.querySelector('div').appendChild(chartImg);
    document.body.appendChild(reportContainer);

    // Generate PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const reportCanvas = await html2canvas(reportContainer);
    const imgData = reportCanvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (reportCanvas.height * pdfWidth) / reportCanvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Performance_Report.pdf');

    // Clean up
    document.body.removeChild(reportContainer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating report. Please try again.');
  }
};

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, Aaryan! 👋
              </h1>
              <p className="text-lg text-slate-500 mt-2">Ready to continue learning?</p>

              <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center text-xl">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Tip of the Day:</div>
                  <div className="text-sm text-yellow-700">{tipOfTheDay}</div>
                </div>
              </div>

              <div className="mt-4 text-slate-500 flex items-center gap-2">
                <i className="fas fa-calendar-alt" />
                {currentDate}
              </div>
            </div>

            <div className="w-full lg:w-80">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="text-6xl text-sky-500">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xl">{user.name}</div>
                    <div className="text-base text-slate-500">{user.email}</div>
                    <div className="inline-block mt-2 bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {user.mbaExam} Aspirant
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setProfileEdit(true)}
                    title="Settings"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center text-sm"
                  >
                    <i className="fas fa-cog" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    title="Logout"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center text-sm"
                  >
                    <i className="fas fa-sign-out-alt" />
                    <span>Logout</span>
                  </button>
                </div>

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
                            <h3 className="text-xl font-bold text-slate-800">Settings</h3>
                            <button 
                              onClick={() => setProfileEdit(false)}
                              className="text-slate-400 hover:text-slate-600 text-xl"
                            >
                              <i className="fas fa-times" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                              <input 
                                value={user.name} 
                                className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                              <input 
                                type="email"
                                value={user.email}
                                className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Exam</label>
                              <div className="grid grid-cols-3 gap-2">
                                {['CAT', 'XAT', 'CMAT', 'NMAT', 'MAT', 'ATMA'].map((exam) => (
                                  <button
                                    key={exam}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                                      ${user.mbaExam === exam 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-all"
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
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <a href="/resume-parser" className="group bg-white hover:shadow-xl transition-all duration-300 rounded-2xl p-6 shadow-md border border-slate-100 hover:scale-105 cursor-pointer block">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <i className="fas fa-file-alt" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-800 mb-1">Resume Parser</div>
              <div className="text-sm text-slate-500">AI-Powered Analysis</div>
            </div>
          </a>

          <div className="group bg-white hover:shadow-xl transition-all duration-300 rounded-2xl p-6 shadow-md border border-slate-100 hover:scale-105 cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <i className="fas fa-brain" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-800 mb-1">AI Quiz</div>
              <div className="text-sm text-slate-500">Interactive Learning</div>
            </div>
          </div>

          <a href="/essay-writing" className="group bg-white hover:shadow-xl transition-all duration-300 rounded-2xl p-6 shadow-md border border-slate-100 hover:scale-105 cursor-pointer block">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <i className="fas fa-pen-fancy" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-800 mb-1">Written Test</div>
              <div className="text-sm text-slate-500">Essay Practice</div>
            </div>
          </a>

          <a href="/mba-interview" className="group bg-white hover:shadow-xl transition-all duration-300 rounded-2xl p-6 shadow-md border border-slate-100 hover:scale-105 cursor-pointer block">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <i className="fas fa-video" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-800 mb-1">Video Interview</div>
              <div className="text-sm text-slate-500">Practice Interviews</div>
            </div>
          </a>
        </div>

        {/* Progress Trend + League & Reports */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex justify-between items-start mb-5">
  <div>
    <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
      <i className="fas fa-chart-line text-blue-600" />
      Section-wise Progress Trend
    </h5>
    <p className="text-sm text-slate-500 mt-1">Performance across Quant, Verbal, and LRDI over 12 weeks</p>
  </div>
  <button 
  onClick={downloadReport}
  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm"
>
  <i className="fas fa-download" />
  Download Report
</button>
</div>
            
            <div className="h-80">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="space-y-6">
            {/* League Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                <i className="fas fa-trophy text-amber-500" />
                Your League
              </h5>
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl border-2 border-white/30">
                    <i className="fas fa-medal" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl">{leagueData.league.name} League</div>
                    <div className="text-sm opacity-90 flex items-center gap-1">
                      <i className="fas fa-star" />
                      {Math.floor(leagueData.league_score)}% League Score
                    </div>
                  </div>
                </div>

                <div className="relative bg-white/15 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Next: {leagueData.next_league.name} League</span>
                    <span>{leagueData.next_league.min_score}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800/40 rounded-full overflow-hidden">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                <i className="fas fa-chart-bar text-blue-600" />
                Quick Stats
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Improvement</span>
                  <span className="text-lg font-bold text-green-600">{stats.improvement}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Current Streak</span>
                  <span className="text-lg font-bold text-green-600">{stats.streak} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Total Quizzes</span>
                  <span className="text-lg font-bold text-amber-600">{stats.totalQuizzes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
              <i className="fas fa-bullseye text-red-600" />
              Areas to Improve
            </h5>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="font-semibold text-slate-800">Weakest Topic</div>
                <div className="text-sm text-slate-600 mt-1">{stats.weakestTopic}</div>
                <div className="text-xs text-slate-500 mt-2">Focus on this area for better results</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="font-semibold text-slate-800">Strongest Topic</div>
                <div className="text-sm text-slate-600 mt-1">{stats.strongestTopic}</div>
                <div className="text-xs text-slate-500 mt-2">Keep up the excellent work!</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="font-semibold text-slate-800">Improvement</div>
                <div className="text-sm text-slate-600 mt-1">{stats.strongestTopic}</div>
                <div className="text-xs text-slate-500 mt-2">Best Enthusiasm!</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="font-semibold text-slate-800">Weak Topic</div>
                <div className="text-sm text-slate-600 mt-1">{stats.weakestTopic}</div>
                <div className="text-xs text-slate-500 mt-2">Focus on formulas and logic!</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
              <i className="fas fa-chart-pie text-purple-600" />
              Weekly Progress
            </h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Quizzes This Week</span>
                  <span className="font-bold text-slate-800">{stats.streak}/{stats.weeklyTarget}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
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
                  <div className="text-xs text-slate-600 mt-1">Avg Score</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.chaptersAttempted}</div>
                  <div className="text-xs text-slate-600 mt-1">Chapters</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-green-700">ACCURACY RATE</div>
                  <div className="text-lg font-bold text-green-700">82%</div>
                </div>
                <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden mt-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-amber-700">AVG TIME/QUESTION</div>
                  <div className="text-lg font-bold text-amber-700">2.8 min</div>
                </div>
                <div className="text-xs text-amber-600 mt-1">Target: 2.5 min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-500" />
                Personalized Recommendations
              </h5>
              <p className="text-sm text-slate-500 mt-1">Based on your recent performance</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="group p-5 rounded-xl bg-gradient-to-br hover:shadow-lg transition-all border border-slate-100 hover:scale-105 duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${rec.color} rounded-xl flex items-center justify-center text-white text-xl mb-3 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${rec.icon}`} />
                </div>
                <div className="font-bold text-slate-800 mb-2">{rec.title}</div>
                <div className="text-sm text-slate-600">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MBA News & Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <i className="fas fa-newspaper text-blue-600" />
              MBA News & Updates
            </h5>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Latest</span>
          </div>
          <div className="space-y-4">
            {mbaNews.map(news => (
              <div key={news.id} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-bullhorn text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-slate-800">{news.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      news.badge === 'Important' ? 'bg-red-100 text-red-700' :
                      news.badge === 'Update' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {news.badge}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{news.description}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-clock" />
                    {news.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}