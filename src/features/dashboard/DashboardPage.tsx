import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sessionRepository, lessonRepository, gameRepository, activityRepository, achievementRepository } from '@/services/storage/repositories';
import { formatDuration, getDateKey } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Keyboard, Target, Zap, Clock, Trophy, Flame, BookOpen, Gamepad2, ArrowRight, Star } from 'lucide-react';
import type { TypingResult, DailyActivity } from '@/types';
import { useAppSelector } from '@/app/store/hooks';
import { XP_PER_LEVEL } from '@/lib/constants';

interface DashboardStats {
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
  practiceTime: number; // in seconds
  currentStreak: number;
  totalXp: number;
  level: number;
}

interface ChartData {
  name: string;
  wpm: number;
  accuracy: number;
}

interface ActivityData {
  name: string;
  minutes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<ChartData[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState(0);

  const settings = useAppSelector((state: any) => state.settings);
  const dailyGoalMinutes = settings?.general?.dailyGoalMinutes || 15;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const allSessions = await sessionRepository.getAll();
        const activity = await activityRepository.getAll();
        
        // Calculate basic stats
        const totalTests = allSessions.length;
        let bestWpm = 0;
        let totalWpm = 0;
        let totalAccuracy = 0;
        let totalPracticeTime = 0; 
        let totalXp = 0;

        allSessions.forEach(session => {
          if (session.wpm > bestWpm) bestWpm = session.wpm;
          totalWpm += session.wpm;
          totalAccuracy += session.accuracy;
          totalPracticeTime += session.duration || 0;
          totalXp += session.xp || 0;
        });

        const avgWpm = totalTests > 0 ? Math.round(totalWpm / totalTests) : 0;
        const avgAccuracy = totalTests > 0 ? Math.round(totalAccuracy / totalTests) : 0;
        
        // Calculate level
        const xpPerLevel = XP_PER_LEVEL || 1000;
        const level = Math.floor(totalXp / xpPerLevel) + 1;

        // Current Streak
        let currentStreak = 0;
        const today = new Date();
        const todayKey = getDateKey(today);
        
        let checkDate = new Date();
        while (true) {
          const key = getDateKey(checkDate);
          const act = activity.find(a => a.date === key);
          if (act && act.practiceTime > 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (key === todayKey) {
             checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        setStats({
          bestWpm,
          avgWpm,
          avgAccuracy,
          totalTests,
          practiceTime: totalPracticeTime,
          currentStreak,
          totalXp,
          level
        });

        // Recent Sessions for WPM chart
        const recent = allSessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10).reverse();
        setRecentSessions(recent.map((s, i) => ({
          name: `Test ${i + 1}`,
          wpm: Math.round(s.wpm),
          accuracy: Math.round(s.accuracy)
        })));

        // Weekly activity
        const weekActivityData: ActivityData[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = getDateKey(d);
          const dayAct = activity.find(a => a.date === key);
          weekActivityData.push({
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            minutes: dayAct ? Math.round(dayAct.practiceTime / 60) : 0
          });
        }
        setWeeklyActivity(weekActivityData);

        // Daily Progress
        const todayActivity = activity.find(a => a.date === todayKey);
        const todayMinutes = todayActivity ? todayActivity.practiceTime / 60 : 0;
        setDailyProgress(Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dailyGoalMinutes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasData = stats && stats.totalTests > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Typist!</h1>
          <p className="text-muted-foreground mt-1">
            {hasData ? "Here's a summary of your typing journey." : "Ready to start your typing journey?"}
          </p>
        </div>
        
        {hasData && stats && (
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border">
            <div className="bg-primary/20 p-1.5 rounded-full text-primary">
              <Star className="w-5 h-5 fill-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Level {stats.level}</div>
              <div className="text-xs text-muted-foreground">{stats.totalXp} XP</div>
            </div>
          </div>
        )}
      </motion.div>

      {!hasData ? (
        // Empty State
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-xl bg-card/50"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Keyboard className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No typing data yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Complete your first typing test or lesson to see your personalized dashboard, track your progress, and earn achievements!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/test" 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Take a Typing Test
            </Link>
            <Link 
              to="/lessons" 
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Start Lessons
            </Link>
          </div>
        </motion.div>
      ) : (
        // Dashboard Content
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Quick Actions & Daily Goal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Daily Goal: {dailyGoalMinutes} Minutes
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{dailyProgress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <Link to="/test" className="flex-1 flex items-center justify-between bg-primary text-primary-foreground rounded-xl p-5 hover:bg-primary/90 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Zap className="w-6 h-6" /></div>
                  <span className="font-semibold text-lg">Quick Test</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/lessons" className="flex-1 flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:bg-accent hover:text-accent-foreground transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary p-2 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                  <span className="font-semibold">Continue Lesson</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={<Trophy className="w-5 h-5" />} label="Best WPM" value={stats?.bestWpm || 0} color="text-yellow-500" variants={itemVariants} />
            <StatCard icon={<Keyboard className="w-5 h-5" />} label="Avg WPM" value={stats?.avgWpm || 0} color="text-blue-500" variants={itemVariants} />
            <StatCard icon={<Target className="w-5 h-5" />} label="Accuracy" value={`${stats?.avgAccuracy || 0}%`} color="text-green-500" variants={itemVariants} />
            <StatCard icon={<Zap className="w-5 h-5" />} label="Total Tests" value={stats?.totalTests || 0} color="text-purple-500" variants={itemVariants} />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Practice Time" value={formatDuration(stats?.practiceTime || 0)} color="text-orange-500" variants={itemVariants} />
            <StatCard icon={<Flame className="w-5 h-5" />} label="Streak" value={`${stats?.currentStreak || 0} days`} color="text-red-500" variants={itemVariants} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Recent WPM</h3>
              <div className="h-[300px] w-full">
                {recentSessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentSessions} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Line type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Activity This Week</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      formatter={(value: number) => [`${value} min`, 'Practice Time']}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, variants }: { icon: React.ReactNode, label: string, value: string | number, color: string, variants: any }) {
  return (
    <motion.div variants={variants} className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-full bg-secondary/50 mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}
