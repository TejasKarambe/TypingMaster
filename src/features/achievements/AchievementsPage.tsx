import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Target, Flame, Trophy, Lock } from 'lucide-react';
import { achievementRepository, sessionRepository, activityRepository, gameRepository, lessonRepository } from '@/services/storage/repositories';
import { Achievement, AchievementProgress } from '@/types/achievement';
import { cn } from '@/lib/utils';

// Hardcoded for now based on prompt requirements
const achievementDefinitions: Achievement[] = [
  { id: 'speed-1', title: 'Speedster I', description: 'Reach 40 WPM in any test', category: 'speed', icon: 'zap', requirement: 40, xpReward: 100 },
  { id: 'speed-2', title: 'Speedster II', description: 'Reach 60 WPM in any test', category: 'speed', icon: 'zap', requirement: 60, xpReward: 250 },
  { id: 'speed-3', title: 'Speedster III', description: 'Reach 80 WPM in any test', category: 'speed', icon: 'zap', requirement: 80, xpReward: 500 },
  { id: 'speed-4', title: 'Sonic', description: 'Reach 100 WPM in any test', category: 'speed', icon: 'zap', requirement: 100, xpReward: 1000 },
  
  { id: 'acc-1', title: 'Sharpshooter', description: 'Complete a test with 95% accuracy', category: 'accuracy', icon: 'target', requirement: 95, xpReward: 100 },
  { id: 'acc-2', title: 'Perfectionist', description: 'Complete a test with 100% accuracy', category: 'accuracy', icon: 'target', requirement: 100, xpReward: 500 },
  
  { id: 'tests-1', title: 'Beginner', description: 'Complete 10 tests', category: 'milestone', icon: 'award', requirement: 10, xpReward: 100 },
  { id: 'tests-2', title: 'Regular', description: 'Complete 50 tests', category: 'milestone', icon: 'award', requirement: 50, xpReward: 300 },
  { id: 'tests-3', title: 'Veteran', description: 'Complete 100 tests', category: 'milestone', icon: 'award', requirement: 100, xpReward: 800 },
];

export const AchievementsPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState<Record<string, AchievementProgress>>({});
  const [stats, setStats] = useState({ maxWpm: 0, maxAcc: 0, totalTests: 0, xp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndLoadAchievements = async () => {
      try {
        const sessions = await sessionRepository.getAll();
        const unlockedData = await achievementRepository.getAll();
        
        let maxWpm = 0;
        let maxAcc = 0;
        let totalTests = sessions.length;
        
        sessions.forEach(s => {
          if (s.wpm > maxWpm) maxWpm = s.wpm;
          if (s.accuracy > maxAcc) maxAcc = s.accuracy;
        });

        // Check for new unlocks
        const newUnlocked = { ...unlockedData.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {} as Record<string, AchievementProgress>) };
        let newlyEarned = false;
        let totalXp = 0;

        for (const def of achievementDefinitions) {
          if (!newUnlocked[def.id]) {
            let earned = false;
            if (def.category === 'speed' && maxWpm >= def.requirement) earned = true;
            if (def.category === 'accuracy' && maxAcc >= def.requirement) earned = true;
            if (def.category === 'milestone' && totalTests >= def.requirement) earned = true;
            
            if (earned) {
              const progress = {
                id: def.id,
                unlockedAt: new Date().toISOString(),
              };
              await achievementRepository.save(progress);
              newUnlocked[def.id] = progress;
              newlyEarned = true;
            }
          }
        }

        // Calculate XP
        Object.keys(newUnlocked).forEach(id => {
          const def = achievementDefinitions.find(d => d.id === id);
          if (def) totalXp += def.xpReward;
        });

        setStats({ maxWpm, maxAcc, totalTests, xp: totalXp });
        setUnlocked(newUnlocked);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAndLoadAchievements();
  }, []);

  const getIcon = (name: string, unlocked: boolean) => {
    const props = { size: 32, className: cn(unlocked ? "text-primary" : "text-text-muted") };
    switch (name) {
      case 'zap': return <Zap {...props} />;
      case 'target': return <Target {...props} />;
      case 'flame': return <Flame {...props} />;
      case 'award':
      default: return <Award {...props} />;
    }
  };

  const level = Math.floor(stats.xp / 1000) + 1;
  const xpToNextLevel = 1000 - (stats.xp % 1000);
  const progressPercent = ((stats.xp % 1000) / 1000) * 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categories = Array.from(new Set(achievementDefinitions.map(a => a.category)));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Trophy className="mr-3 text-primary" size={32} />
            Achievements
          </h1>
          <p className="text-text-secondary">Complete challenges to earn XP and level up.</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border min-w-[300px] flex-1 md:flex-none">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-text-secondary text-sm">Current Level</span>
              <div className="text-3xl font-bold text-primary">Lvl {level}</div>
            </div>
            <div className="text-right">
              <span className="text-text-secondary text-sm">Total XP</span>
              <div className="font-mono font-bold">{stats.xp}</div>
            </div>
          </div>
          <div className="h-3 bg-surface-muted rounded-full overflow-hidden mb-2 border border-border">
            <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-text-muted text-right">{xpToNextLevel} XP to Level {level + 1}</p>
        </div>
      </div>

      <div className="space-y-10">
        {categories.map(category => (
          <div key={category}>
            <h2 className="text-xl font-bold mb-4 capitalize flex items-center border-b border-border pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementDefinitions.filter(a => a.category === category).map((achievement, i) => {
                const isUnlocked = !!unlocked[achievement.id];
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "card p-4 flex items-center space-x-4 border-2 transition-all duration-300 relative overflow-hidden",
                      isUnlocked ? "border-primary/50 bg-surface" : "border-transparent bg-surface-muted grayscale opacity-60"
                    )}
                  >
                    {!isUnlocked && <Lock className="absolute top-2 right-2 text-text-muted opacity-30" size={16} />}
                    <div className={cn("p-3 rounded-xl", isUnlocked ? "bg-primary/10" : "bg-surface")}>
                      {getIcon(achievement.icon, isUnlocked)}
                    </div>
                    <div className="flex-1">
                      <h3 className={cn("font-bold", isUnlocked ? "text-text" : "text-text-secondary")}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">{achievement.description}</p>
                      {isUnlocked && unlocked[achievement.id].unlockedAt && (
                        <p className="text-[10px] text-text-muted mt-2">
                          Unlocked: {new Date(unlocked[achievement.id].unlockedAt!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={cn("text-xs font-bold font-mono px-2 py-1 rounded", isUnlocked ? "bg-primary/20 text-primary" : "bg-surface text-text-muted")}>
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
