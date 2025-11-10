import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const tips = [
  'Consistency beats intensity.',
  'Every day is a new opportunity to learn.',
  'Small steps every day lead to big results.',
  'Mistakes are proof that you are trying.',
  'Stay curious and keep exploring.',
  'Believe in yourself and all that you are.',
  'Success is the sum of small efforts repeated.',
  'Learning never exhausts the mind.',
  'Progress, not perfection.',
  'Your only limit is your mind.',
  'Dream big, work hard, stay focused.',
  'The expert in anything was once a beginner.',
  'Push yourself, because no one else is going to do it for you.',
  'Don’t watch the clock; do what it does. Keep going.',
  'You don’t have to be perfect to be amazing.'
];

function getTipOfTheDay() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = dateSeed % tips.length;
  return tips[index];
}

export default function Dashboard() {
  const { userid } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [user, setUser] = useState({});
  const [editUser, setEditUser] = useState({ password: '' });
  const [profileEdit, setProfileEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [leagueData, setLeagueData] = useState({ league: { name: 'Loading...' }, progress: 0 });

  const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0, chaptersAttempted: 0, streak: 0, weeklyTarget: 7 });
  const [progressData, setProgressData] = useState([]);
  const [progressLabels, setProgressLabels] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [announcements] = useState([
    { id: 1, title: 'New Quizzes Added!', message: 'Check out the latest quizzes in Science.', date: '2024-06-10' },
    { id: 2, title: 'Maintenance Notice', message: 'Platform will be down for maintenance on June 12.', date: '2024-06-09' }
  ]);

  const tipOfTheDay = getTipOfTheDay();
  const greeting = getGreeting();
  const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // resolvedUserId falls back to the authenticated user's id when route param is missing
  const resolvedUserId = userid || authUser?.id;

  useEffect(() => {
    // only fetch when we have a user id (from route or auth)
    if (resolvedUserId) {
      fetchUserProfile();
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  useEffect(() => {
    if (progressData.length && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      // destroy existing chart if any
      if (canvasRef.current._chart) canvasRef.current._chart.destroy();
      canvasRef.current._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: progressLabels,
          datasets: [{
            label: 'Score (%)',
            data: progressData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (context) => 'Date: ' + context[0].label,
                label: (context) => 'Score: ' + context.parsed.y + '%'
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280' }, title: { display: true, text: 'Quiz Submission Date', color: '#6b7280' } },
            y: { beginAtZero: true, max: 100, ticks: { color: '#6b7280', callback: (v) => v + '%' }, title: { display: true, text: 'Score (%)', color: '#6b7280' } }
          }
        }
      });
    }
  }, [progressData, progressLabels]);

  async function fetchLeague(payload) {
    try {
      const res = await api.post('/auth/league', payload);
      setLeagueData(res.data);
    } catch (e) {
      console.error('Failed to fetch league', e);
    }
  }

  async function fetchUserProfile() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`auth/profile/${resolvedUserId}`);
      setUser(res.data);
    } catch (e) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', e);
    } finally {
      setIsLoading(false);
      // after profile, fetch stats
      fetchUserStats();
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const payload = { name: editUser.name, qualification: editUser.qualification };
      if (editUser.password && editUser.password.trim() !== '') payload.password = editUser.password;
      await api.put(`/auth/profile/${resolvedUserId}`, payload);
      await fetchUserProfile();
      setProfileEdit(false);
    } catch (e) {
      setError('Failed to update profile');
      console.error('Error updating profile:', e);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function getScoreClass(score) {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800';
    if (score >= 80) return 'bg-sky-100 text-sky-800';
    if (score >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  }

  async function fetchUserStats() {
    try {
      const [quizzesRes, , resultsRes] = await Promise.all([
        api.get('/auth/quizzes'),
        api.get('/auth/subjects'),
        api.get('/auth/results'),
      ]);

      const quizzes = quizzesRes.data.quizzes || [];
      const quizIdToChapterId = Object.fromEntries(quizzes.map(q => [Number(q.id), q.chapter_id]));

  const userResults = (resultsRes.data.results || []).filter(r => Number(r.user_id) === Number(resolvedUserId)).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));

      let totalScore = 0; let totalQuizzes = 0; const chapterIds = new Set(); const dateSet = new Set();
      const progressScores = []; const progressLabelList = []; const activityList = [];

      for (let i=0;i<userResults.length;i++){
        const r = userResults[i]; const score = r.score||0; totalScore+=score; totalQuizzes++;
        const chapterId = quizIdToChapterId[Number(r.quiz_id)]; if (chapterId!==undefined && chapterId!==null) chapterIds.add(chapterId);
        if (r.created_at) dateSet.add(new Date(r.created_at).toDateString());
        progressScores.push(score);
        if (r.created_at){ const date = new Date(r.created_at); progressLabelList.push(`${date.getDate()} ${date.toLocaleString('default',{month:'long'})}`); } else progressLabelList.push('');
      }

      // streak calculation
      const uniqueDates = Array.from(dateSet).map(d=>new Date(d)).sort((a,b)=>a-b);
      let streak = 0;
      if (uniqueDates.length>0){
        let current = new Date(); current.setHours(0,0,0,0);
        for (let i=uniqueDates.length-1;i>=0;i--){
          const date = uniqueDates[i]; if (date.getTime()===current.getTime()){ streak++; current.setDate(current.getDate()-1); }
          else if (date.getTime() < current.getTime()){ if (date.getTime() === current.getTime() - 24*60*60*1000){ streak++; current.setDate(current.getDate()-1); } else break; }
        }
      }

      for (let i=Math.max(0,userResults.length-5); i<userResults.length; i++){ const r = userResults[i]; activityList.push({ id: r.id||i, quizId: r.quiz_id, quizTitle: r.quiz_title||'Quiz', score: r.score, date: r.created_at? r.created_at.slice(0,10):'' }); }
      activityList.reverse();

      setStats({ totalQuizzes, avgScore: totalQuizzes? Math.round(totalScore/totalQuizzes):0, chaptersAttempted: chapterIds.size, streak, weeklyTarget:7 });
      setProgressData(progressScores); setProgressLabels(progressLabelList); setRecentActivity(activityList);

  // fetch league (use freshly computed totals)
  await fetchLeague({ avg_score: totalQuizzes ? Math.round(totalScore/totalQuizzes) : 0, streak, quizzes_submitted: totalQuizzes });

    } catch (e) {
      console.error('Failed to fetch user stats', e);
    }
  }

  async function fetchSubjects(){
    try{
      const res = await api.get('/subjects/with-details');
      const allSubjects = (res.data || []).map(subj=>({ id: subj.id, name: subj.name, description: subj.description, chapters: Array.isArray(subj.chapters)? subj.chapters.length: 0, quizzes: Array.isArray(subj.chapters)? subj.chapters.reduce((sum,ch)=>sum+(Array.isArray(ch.quizzes)?ch.quizzes.length:0),0):0, icon: 'fas fa-book', color: '#00838f' }));
      setSubjects(allSubjects.slice(0,2));
    }catch(e){ console.error('Failed to fetch subjects', e); setSubjects([]); }
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-slate-800">Welcome back, {user.name || 'Learner'}! 👋</h1>
              <p className="text-lg text-slate-500 mt-2">{greeting} Ready to continue learning?</p>

              <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-400 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Tip of the Day:</div>
                  <div className="text-sm text-yellow-700">{tipOfTheDay}</div>
                </div>
              </div>

              <div className="mt-4 text-slate-500 flex items-center gap-2"><i className="fas fa-calendar-alt" />{currentDate}</div>
              {isLoading && (
                <div className="mt-4 p-3 bg-slate-100 text-slate-700 rounded">Loading...</div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-rose-100 text-rose-700 rounded">{error}</div>
              )}
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {!profileEdit ? (
                  <div className="flex items-center gap-4">
                    <div className="text-4xl text-sky-500"><i className="fas fa-user-circle"></i></div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                      <div className="inline-block mt-2 bg-sky-600 text-white px-3 py-1 rounded-full text-sm">{user.qualification}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={()=>{ setEditUser({ ...user, password: '' }); setProfileEdit(true); }} className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center hover:bg-sky-500 hover:text-white"><i className="fas fa-edit" /></button>
                      <button onClick={logout} title="Logout" className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white mt-2"><i className="fas fa-sign-out-alt" /></button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveProfile} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Name</label>
                      <input value={editUser.name||''} onChange={(e)=>setEditUser({...editUser, name: e.target.value})} className="mt-1 block w-full border border-slate-200 rounded-md p-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Qualification</label>
                      <input value={editUser.qualification||''} onChange={(e)=>setEditUser({...editUser, qualification: e.target.value})} className="mt-1 block w-full border border-slate-200 rounded-md p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">New Password</label>
                      <input id="edit-password" value={editUser.password||''} onChange={(e)=>setEditUser({...editUser, password: e.target.value})} type="password" autoComplete="new-password" placeholder="Leave blank to keep current password" className="mt-1 block w-full border border-slate-200 rounded-md p-2" />
                      <small className="text-slate-400">Leave blank to keep your current password.</small>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={()=>{ setProfileEdit(false); setError(null); }} className="flex-1 bg-gray-100 py-2 rounded-md">Cancel</button>
                      <button type="submit" className="flex-1 bg-sky-600 text-white py-2 rounded-md">Save Changes</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-sky-500 to-indigo-700 text-white rounded-lg flex items-center justify-center text-xl"><i className="fas fa-clipboard-check" /></div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{stats.totalQuizzes}</div>
              <div className="text-sm text-slate-500">Quizzes Submitted</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-cyan-400 to-sky-700 text-white rounded-lg flex items-center justify-center text-xl"><i className="fas fa-book" /></div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{stats.chaptersAttempted}</div>
              <div className="text-sm text-slate-500">Chapters Attempted</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-400 to-emerald-600 text-white rounded-lg flex items-center justify-center text-xl"><i className="fas fa-bullseye" /></div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{stats.avgScore}%</div>
              <div className="text-sm text-slate-500">Average Score</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-yellow-400 to-orange-600 text-white rounded-lg flex items-center justify-center text-xl"><i className="fas fa-fire" /></div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{stats.streak}</div>
              <div className="text-sm text-slate-500">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Charts + League */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <div className="mb-3">
              <h5 className="font-semibold text-slate-800"><i className="fas fa-chart-line mr-2" /> Progress Trend</h5>
              <p className="text-sm text-slate-500">Your performance over all quizzes submitted</p>
            </div>
            <div className="h-72">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            {leagueData && leagueData.league ? (
              <div>
                <div className="mb-3">
                  <h5 className="font-semibold text-slate-800"><i className="fas fa-trophy mr-2" /> Your League</h5>
                  <p className="text-sm text-slate-500">Progress through leagues by improving your scores</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${leagueData.league.color||'#3b82f6'} 0%, rgba(0,0,0,0.1) 100%)`, color: 'white' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><i className={`fas ${leagueData.league.icon}`} /></div>
                    <div>
                      <div className="font-bold text-lg">{leagueData.league.name} League</div>
                      <div className="text-sm opacity-90"><i className="fas fa-star mr-1" />{Math.floor(leagueData.league_score||0)}% League Score</div>
                    </div>
                  </div>

                  {leagueData.next_league ? (
                    <div className="mt-4 bg-white/10 p-3 rounded">
                      <div className="flex justify-between text-sm mb-2"><span>Next: {leagueData.next_league.name}</span><span>Starts from {leagueData.next_league.min_score}%</span></div>
                      <div className="w-full h-3 bg-slate-200 rounded overflow-hidden">
                        <div className="h-3 bg-white rounded" style={{ width: `${leagueData.progress}%` }} />
                      </div>
                      <div className="text-right text-sm mt-2">{leagueData.progress}%</div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center bg-white/10 p-3 rounded"> <i className="fas fa-crown mr-2" /> You've reached the highest league!</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">Loading League...</div>
            )}
          </div>
        </div>

        {/* Explore Subjects */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-teal-700 font-semibold"><i className="fas fa-layer-group mr-2" /> Explore Subjects</h5>
              <p className="text-sm text-teal-700">Browse all your available subjects and chapters</p>
            </div>
            <a className="bg-linear-to-br from-teal-600 to-cyan-500 text-white px-4 py-2 rounded" href={`/user/subjects/${resolvedUserId}`}>Explore All <i className="fas fa-arrow-right ml-2" /></a>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="rounded-lg p-4 bg-linear-to-br from-cyan-50 to-sky-50">
                <div className="text-2xl text-teal-700 mb-2"><i className={s.icon} /></div>
                <div className="font-semibold text-teal-700">{s.name}</div>
                <div className="text-sm text-slate-500">{s.chapters} chapters · {s.quizzes} quizzes</div>
                <a className="mt-3 inline-block bg-linear-to-br from-teal-600 to-cyan-500 text-white px-3 py-2 rounded" href={`/subjects/${s.id}/chapters`}>Explore <i className="fas fa-arrow-right ml-2" /></a>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-slate-800">Recent Activity</h5>
            <div className="text-sm text-slate-500">Last 5 submissions</div>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 && <div className="text-sm text-slate-400">No recent activity.</div>}
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <div>
                  <div className="font-medium text-slate-800">{item.quizTitle}</div>
                  <div className="text-xs text-slate-500">{item.date} • Chapter {item.chapterName || item.quizId}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreClass(item.score)}`}>{item.score}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow">
            <h6 className="font-semibold text-slate-800"><i className="fas fa-bullhorn mr-2" /> Latest Updates</h6>
            <div className="mt-4 space-y-4">
              {announcements.map(a=> (
                <div key={a.id} className="flex gap-3 bg-sky-50 p-3 rounded">
                  <div className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center"><i className="fas fa-info-circle" /></div>
                  <div>
                    <div className="font-semibold text-slate-800">{a.title}</div>
                    <div className="text-sm text-slate-500">{a.message}</div>
                    <div className="text-xs text-slate-400">{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
