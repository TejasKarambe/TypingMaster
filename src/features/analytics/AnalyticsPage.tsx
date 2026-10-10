import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Target, Zap, Calendar } from 'lucide-react';
import { sessionRepository, activityRepository } from '@/services/storage/repositories';

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalTime: 0,
    avgWpm: 0,
    bestWpm: 0,
    avgAccuracy: 0,
  });
  const [wpmData, setWpmData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [errorMap, setErrorMap] = useState<Record<string, number>>({});
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const sessions = await sessionRepository.getAll();
        const activities = await activityRepository.getAll();
        
        // Filter by time range
        const now = new Date();
        const cutoff = new Date(now.setDate(now.getDate() - timeRange)).getTime();
        
        const recentSessions = sessions.filter(s => (s.startedAt || s.completedAt || 0) > cutoff);
        
        if (recentSessions.length > 0) {
          const totalWpm = recentSessions.reduce((acc, s) => acc + s.wpm, 0);
          const totalAcc = recentSessions.reduce((acc, s) => acc + (s.accuracy <= 1 ? s.accuracy * 100 : s.accuracy), 0);
          const bestWpm = Math.max(...recentSessions.map(s => s.wpm));
          
          setStats({
            totalTests: recentSessions.length,
            totalTime: Math.round(recentSessions.reduce((acc, s) => acc + (s.durationMs || 0), 0) / 1000),
            avgWpm: Math.round(totalWpm / recentSessions.length),
            bestWpm,
            avgAccuracy: Number((totalAcc / recentSessions.length).toFixed(1)),
          });

          // Process WPM Data for chart
          const chartData = recentSessions.slice().sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0)).map(s => ({
            date: new Date(s.startedAt || s.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            wpm: s.wpm,
            accuracy: Number((s.accuracy <= 1 ? s.accuracy * 100 : s.accuracy).toFixed(1))
          }));
          setWpmData(chartData);

          // Process Error Map
          const mergedErrors: Record<string, number> = {};
          recentSessions.forEach(s => {
            if (s.errorMap) {
              Object.entries(s.errorMap).forEach(([char, count]) => {
                mergedErrors[char] = (mergedErrors[char] || 0) + (count as number);
              });
            }
          });
          setErrorMap(mergedErrors);
        } else {
          setStats({ totalTests: 0, totalTime: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0 });
          setWpmData([]);
          setErrorMap({});
        }

        // Process Activity Data
        const recentActivity = activities
          .filter(a => new Date(a.dateKey).getTime() > cutoff)
          .sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime())
          .map(a => ({
            date: new Date(a.dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            minutes: Math.round(a.practiceDurationMs / 60000)
          }));
        setActivityData(recentActivity);

      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const problematicKeys = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Activity className="mr-3 text-primary" size={32} />
            Analytics Dashboard
          </h1>
          <p className="text-text-secondary">Track your typing progress over time.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-2 bg-surface p-1 rounded-lg border border-border">
          {[7, 30, 365].map(days => (
            <button
              key={days}
              className={`px-4 py-1 rounded-md text-sm transition-colors ${timeRange === days ? 'bg-primary text-white' : 'hover:bg-surface-hover'}`}
              onClick={() => setTimeRange(days)}
            >
              {days === 365 ? 'All Time' : `${days} Days`}
            </button>
          ))}
        </div>
      </div>

      {stats.totalTests === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <Activity className="mx-auto text-text-muted mb-4" size={48} />
          <h3 className="text-xl font-bold mb-2">Not enough data</h3>
          <p className="text-text-secondary">Complete some typing tests to see your analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Zap size={24} /></div>
              <div>
                <p className="text-sm text-text-secondary">Avg Speed</p>
                <p className="text-2xl font-bold">{stats.avgWpm} <span className="text-sm font-normal text-text-muted">WPM</span></p>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-lg"><Target size={24} /></div>
              <div>
                <p className="text-sm text-text-secondary">Avg Accuracy</p>
                <p className="text-2xl font-bold">{stats.avgAccuracy}%</p>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg"><Clock size={24} /></div>
              <div>
                <p className="text-sm text-text-secondary">Practice Time</p>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-orange-500/20 text-orange-500 rounded-lg"><Calendar size={24} /></div>
              <div>
                <p className="text-sm text-text-secondary">Total Tests</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="card p-6 col-span-1 lg:col-span-2">
              <h3 className="text-lg font-bold mb-6">Typing Speed History</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wpmData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="wpm" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    <CartesianGrid stroke="#333" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                    <YAxis stroke="#888" tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold mb-6">Problematic Keys</h3>
              {problematicKeys.length > 0 ? (
                <div className="space-y-4">
                  {problematicKeys.map(([char, count], index) => (
                    <div key={char} className="flex items-center">
                      <div className="w-8 text-center font-mono font-bold text-lg bg-surface p-1 rounded mr-4">
                        {char === ' ' ? '␣' : char}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${(count / problematicKeys[0][1]) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-10 text-right text-sm text-text-secondary ml-2">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-8">No error data available.</p>
              )}
            </div>
            
            <div className="card p-6 col-span-1 lg:col-span-3">
              <h3 className="text-lg font-bold mb-6">Daily Practice (Minutes)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                    <YAxis stroke="#888" tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
