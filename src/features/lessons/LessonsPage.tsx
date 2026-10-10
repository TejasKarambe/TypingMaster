import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, ChevronDown, BookOpen, Check, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { levels } from '@/data/lessons/curriculum';
import { lessonRepository } from '@/services/storage/repositories';
import { LessonProgress } from '@/types';
import { cn } from '@/lib/utils';

export const LessonsPage: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'level-1': true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const allProgress = await lessonRepository.getAll();
        const progressMap = allProgress.reduce((acc, curr) => {
          acc[curr.lessonId] = curr;
          return acc;
        }, {} as Record<string, LessonProgress>);
        setProgress(progressMap);
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const isLessonAvailable = (lessonId: string, prerequisiteIds: string[]) => {
    if (lessonId === 'l1-1') return true; // Level 1 Lesson 1 always available
    if (!prerequisiteIds || prerequisiteIds.length === 0) return true;
    
    return prerequisiteIds.every((id) => {
      const p = progress[id];
      return p && p.completed;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="mr-3 text-accent" size={32} />
          Typing Curriculum
        </h1>
        <p className="text-text-secondary">
          Master touch typing step by step. Complete lessons to unlock new challenges.
        </p>
      </div>

      <div className="space-y-6">
        {levels.map((level, index) => {
          const isExpanded = expandedLevels[level.id] || false;
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden p-0"
            >
              <div 
                className="p-4 bg-bg-tertiary/50 hover:bg-bg-tertiary cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => toggleLevel(level.id)}
              >
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{level.title}</h2>
                  <p className="text-sm text-text-secondary">{level.description}</p>
                </div>
                <ChevronDown 
                  className={cn("transition-transform text-text-secondary", isExpanded ? "rotate-180" : "")} 
                />
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {level.lessons.map((lesson) => {
                    const lessonProgress = progress[lesson.id];
                    const available = isLessonAvailable(lesson.id, lesson.prerequisiteIds || []);
                    const completed = lessonProgress?.completed || false;
                    const stars = lessonProgress?.stars || 0;

                    return (
                      <div 
                        key={lesson.id}
                        className={cn(
                          "flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border transition-colors",
                          available ? "bg-bg-card border-border hover:border-border-hover" : "bg-bg-secondary/40 border-border opacity-60"
                        )}
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="flex items-center mb-1">
                            {!available && <Lock className="text-text-muted mr-2" size={16} />}
                            {completed && <Check className="text-success mr-2" size={16} />}
                            <h3 className="font-semibold text-lg text-text-primary">{lesson.title}</h3>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">{lesson.description}</p>
                          <div className="flex items-center text-xs text-text-muted">
                            <span className="mr-3">Target keys: <strong className="text-accent uppercase font-mono">{lesson.targetKeys.join(' ')}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {available && (
                            <div className="flex">
                              {[1, 2, 3].map((star) => (
                                <Star 
                                  key={star} 
                                  size={18} 
                                  className={cn(
                                    star <= stars ? "text-warning fill-warning" : "text-border"
                                  )} 
                                />
                              ))}
                            </div>
                          )}

                          {available ? (
                            <Link 
                              to={`/lessons/${lesson.id}`}
                              className={cn(
                                "flex items-center gap-1.5 text-sm", 
                                completed ? "btn-secondary py-2 px-4" : "btn-primary py-2 px-4"
                              )}
                            >
                              <Play size={14} />
                              {completed ? 'Review' : 'Start'}
                            </Link>
                          ) : (
                            <button disabled className="bg-bg-tertiary text-text-muted px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonsPage;
