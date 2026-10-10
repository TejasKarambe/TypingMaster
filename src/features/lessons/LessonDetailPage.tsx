import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Target, RefreshCw, ChevronRight } from 'lucide-react';
import { getLesson } from '@/data/lessons/curriculum';
import { lessonRepository, activityRepository } from '@/services/storage/repositories';
import { LessonProgress, LessonData, TypingResult } from '@/types';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { cn, getDateKey } from '@/lib/utils';

export const LessonDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [phase, setPhase] = useState<'intro' | 'practice' | 'result'>('intro');
  const [stars, setStars] = useState(0);
  const [lastResult, setLastResult] = useState<TypingResult | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    if (lessonId) {
      const found = getLesson(lessonId);
      setLesson(found || null);
    }
  }, [lessonId]);

  const targetText = lesson ? lesson.practiceText || lesson.warmupText || '' : '';

  const handleComplete = async (completedResult: TypingResult) => {
    if (!lesson) return;
    setLastResult(completedResult);

    const requiredAccuracy = lesson.requiredAccuracy || 90;
    const requiredWpm = lesson.requiredWpm || 20;
    const actualAccuracy = completedResult.accuracy <= 1 ? completedResult.accuracy * 100 : completedResult.accuracy;

    let earnedStars = 0;
    if (actualAccuracy >= requiredAccuracy) {
      earnedStars = 1;
      if (completedResult.wpm >= requiredWpm) {
        earnedStars = 2;
        if (actualAccuracy >= 98 && completedResult.wpm >= requiredWpm * 1.2) {
          earnedStars = 3;
        }
      }
    }
    setStars(earnedStars);

    const prev = await lessonRepository.get(lesson.id);
    const progress: LessonProgress = {
      lessonId: lesson.id,
      attempts: (prev?.attempts || 0) + 1,
      completed: (prev?.completed || false) || (earnedStars > 0),
      stars: Math.max(earnedStars, prev?.stars || 0),
      bestWpm: Math.max(completedResult.wpm, prev?.bestWpm || 0),
      bestAccuracy: Math.max(actualAccuracy, prev?.bestAccuracy || 0),
      latestWpm: completedResult.wpm,
      latestAccuracy: actualAccuracy,
      completedAt: earnedStars > 0 ? (prev?.completedAt || Date.now()) : prev?.completedAt,
      updatedAt: Date.now()
    };
    await lessonRepository.save(progress);

    // Update daily activity
    const todayKey = getDateKey();
    const activity = await activityRepository.getOrCreate(todayKey);
    activity.lessonsCompleted += earnedStars > 0 ? 1 : 0;
    activity.practiceDurationMs += completedResult.durationMs;
    activity.xpEarned += earnedStars > 0 ? lesson.xpReward : 10;
    if (completedResult.wpm > activity.bestWpm) activity.bestWpm = completedResult.wpm;
    await activityRepository.update(activity);

    setPhase('result');
  };

  const engine = useTypingEngine({
    testConfig: {
      mode: 'words',
      duration: 0,
      wordCount: 50,
      difficulty: 'medium',
      punctuation: false,
      numbers: false,
      symbols: false,
      capitalization: false,
      language: 'en',
      textSource: 'words',
      quoteLength: 'medium'
    },
    customText: targetText,
    onComplete: handleComplete,
    sessionType: 'lesson'
  });

  if (!lessonId) return null;

  if (!lesson && phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
        <button className="btn-primary" onClick={() => navigate('/lessons')}>
          Back to Lessons
        </button>
      </div>
    );
  }

  const startPractice = () => {
    engine.restart(targetText);
    setPhase('practice');
  };

  const retryLesson = () => {
    engine.restart(targetText);
    setPhase('practice');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col">
      <button
        className="flex items-center text-text-secondary hover:text-accent mb-6 transition-colors w-fit"
        onClick={() => navigate('/lessons')}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Curriculum
      </button>

      {phase === 'intro' && lesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-10"
        >
          <div className="mb-6 flex justify-center">
            <div className="bg-accent/15 p-4 rounded-full">
              <Target size={48} className="text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">{lesson.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-bg-tertiary p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Target Keys</span>
              <span className="font-mono text-xl font-bold text-accent">{lesson.targetKeys.join(' ').toUpperCase()}</span>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Passing Goal</span>
              <span className="font-bold">{lesson.requiredWpm || 20} WPM / {lesson.requiredAccuracy || 90}%</span>
            </div>
          </div>

          <button className="btn-primary text-lg px-8 py-3" onClick={startPractice}>
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{lesson.title}</h2>
              <p className="text-text-muted text-sm">{lesson.objective}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-xs text-text-muted block">WPM</span>
                <span className="font-mono font-bold text-accent text-xl">{engine.metrics.wpm}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-text-muted block">Acc</span>
                <span className="font-mono font-bold text-success text-xl">
                  {(engine.metrics.accuracy <= 1 ? engine.metrics.accuracy * 100 : engine.metrics.accuracy).toFixed(0)}%
                </span>
              </div>
              <button className="btn-secondary p-2.5" onClick={retryLesson} title="Restart">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div
            tabIndex={0}
            onKeyDown={engine.handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="outline-none"
            ref={engine.inputRef as React.RefObject<HTMLDivElement>}
          >
            <TypingDisplay
              chars={engine.state.chars}
              currentIndex={engine.state.currentIndex}
              isFocused={isFocused}
              onFocus={engine.focus}
            />
          </div>
        </motion.div>
      )}

      {phase === 'result' && lesson && lastResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-lg mx-auto w-full py-10"
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
                transition={{ delay: star * 0.15 }}
              >
                <Star
                  size={48}
                  className={cn(
                    "transition-colors duration-500",
                    star <= stars ? "text-warning fill-warning" : "text-border"
                  )}
                />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-bg-tertiary p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Speed</span>
              <span className={cn("text-2xl font-bold font-mono", lastResult.wpm >= (lesson.requiredWpm || 20) ? "text-success" : "text-error")}>
                {lastResult.wpm} WPM
              </span>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-lg">
              <span className="block text-sm text-text-muted mb-1">Accuracy</span>
              <span className={cn("text-2xl font-bold font-mono", (lastResult.accuracy <= 1 ? lastResult.accuracy * 100 : lastResult.accuracy) >= (lesson.requiredAccuracy || 90) ? "text-success" : "text-error")}>
                {(lastResult.accuracy <= 1 ? lastResult.accuracy * 100 : lastResult.accuracy).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={retryLesson}>
              <RefreshCw size={18} />
              Retry
            </button>
            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={() => navigate('/lessons')}>
              Continue
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonDetailPage;
