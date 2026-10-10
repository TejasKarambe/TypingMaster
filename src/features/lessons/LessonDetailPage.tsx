import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Target, RefreshCw, ChevronRight } from 'lucide-react';
import { levels } from '@/data/lessons/curriculum';
import { lessonRepository, activityRepository } from '@/services/storage/repositories';
import { LessonProgress } from '@/types/lesson';
import { useTypingEngine } from '@/features/typing/hooks/useTypingEngine';
import { cn } from '@/lib/utils';
import { TypingDisplay } from '@/features/typing/components/TypingDisplay';
import { LiveStats } from '@/features/typing/components/LiveStats';

export const LessonDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [phase, setPhase] = useState<'intro' | 'practice' | 'result'>('intro');
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (lessonId) {
      let found = null;
      for (const level of levels) {
        const l = level.lessons.find((les) => les.id === lessonId);
        if (l) {
          found = l;
          break;
        }
      }
      setLesson(found);
    }
  }, [lessonId]);

  const handleComplete = async (metrics: any) => {
    if (!lesson) return;
    
    // Calculate stars
    let earnedStars = 0;
    if (metrics.accuracy >= lesson.passingCriteria.accuracy) {
      earnedStars = 1;
      if (metrics.wpm >= lesson.passingCriteria.wpm) {
        earnedStars = 2;
        if (metrics.accuracy >= 98 && metrics.wpm >= lesson.passingCriteria.wpm * 1.2) {
          earnedStars = 3;
        }
      }
    }
    setStars(earnedStars);

    // Save progress
    const progress: LessonProgress = {
      lessonId: lesson.id,
      completed: earnedStars > 0,
      stars: Math.max(earnedStars, lesson.stars || 0), // Assuming we might want to fetch best stars if we had it loaded
      bestWpm: metrics.wpm,
      bestAccuracy: metrics.accuracy,
      lastPlayed: Date.now()
    };
    
    await lessonRepository.save(progress);

    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    const activity = await activityRepository.getById(today);
    if (activity) {
      activity.lessonsCompleted += (earnedStars > 0 ? 1 : 0);
      activity.practiceTime += metrics.duration;
      await activityRepository.save(activity);
    } else {
      await activityRepository.save({
        date: today,
        testsCompleted: 0,
        lessonsCompleted: earnedStars > 0 ? 1 : 0,
        gamesPlayed: 0,
        practiceTime: metrics.duration
      });
    }

    setPhase('result');
  };

  const {
    state,
    metrics,
    handlers: { handleKeyDown, reset }
  } = useTypingEngine({
    text: lesson?.text || '',
    mode: 'lesson',
    duration: 0,
    onComplete: handleComplete
  });

  // Focus trap for typing
  useEffect(() => {
    if (phase === 'practice') {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        // Prevent default scrolling for space and arrows
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
          e.preventDefault();
        }
        handleKeyDown(e.key, e.code, e.ctrlKey, e.altKey, e.metaKey, e.shiftKey);
      };
      
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [phase, handleKeyDown]);

  if (!lessonId) return null;
  
  if (!lesson && phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
          Back to Lessons
        </button>
      </div>
    );
  }

  const startPractice = () => {
    reset();
    setPhase('practice');
  };

  const retryLesson = () => {
    reset();
    setPhase('practice');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <button 
        className="flex items-center text-text-secondary hover:text-primary mb-6 transition-colors w-fit"
        onClick={() => navigate('/lessons')}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Curriculum
      </button>

      {phase === 'intro' && lesson && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 p-4 rounded-full">
              <Target size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <p className="text-lg text-text-secondary mb-8">{lesson.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-surface p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Target Keys</span>
              <span className="font-mono text-xl font-bold text-primary">{lesson.targetKeys.join(' ')}</span>
            </div>
            <div className="bg-surface p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Passing Goal</span>
              <span className="font-bold">{lesson.passingCriteria.wpm} WPM / {lesson.passingCriteria.accuracy}%</span>
            </div>
          </div>

          <button className="btn btn-primary text-lg px-8 py-3" onClick={startPractice}>
            Start Practice
          </button>
        </motion.div>
      )}

      {phase === 'practice' && lesson && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
            <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-border">
              <LiveStats metrics={metrics} showLive={true} />
              <button className="btn btn-secondary" onClick={retryLesson} title="Restart">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-surface rounded-xl border border-border p-8 shadow-sm">
            <TypingDisplay
              text={lesson.text}
              currentIndex={state.currentIndex}
              errors={state.errors}
              status={state.status}
              cursorPosition={state.cursorPosition}
            />
          </div>
        </motion.div>
      )}

      {phase === 'result' && lesson && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center max-w-lg mx-auto w-full"
        >
          <h2 className="text-3xl font-bold mb-6">
            {stars > 0 ? 'Lesson Passed!' : 'Keep Trying!'}
          </h2>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: star * 0.2 }}
              >
                <Star 
                  size={64} 
                  className={cn(
                    "transition-colors duration-500",
                    star <= stars ? "text-yellow-400 fill-yellow-400" : "text-border"
                  )} 
                />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Speed</span>
              <span className={cn("text-2xl font-bold", metrics.wpm >= lesson.passingCriteria.wpm ? "text-green-500" : "text-red-500")}>
                {Math.round(metrics.wpm)} WPM
              </span>
            </div>
            <div className="bg-surface p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Accuracy</span>
              <span className={cn("text-2xl font-bold", metrics.accuracy >= lesson.passingCriteria.accuracy ? "text-green-500" : "text-red-500")}>
                {metrics.accuracy.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-secondary flex-1" onClick={retryLesson}>
              <RefreshCw size={20} className="mr-2" />
              Retry
            </button>
            <button className="btn btn-primary flex-1" onClick={() => navigate('/lessons')}>
              Continue
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonDetailPage;
