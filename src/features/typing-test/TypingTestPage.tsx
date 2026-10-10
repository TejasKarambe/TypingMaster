import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { TestResult } from '@/components/typing/TestResult';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { setTestConfig, setLastResult } from '@/app/store/typingSlice';
import { sessionRepository } from '@/services/storage/repositories';
import { activityRepository } from '@/services/storage/repositories/activityRepository';
import { getDateKey, formatNumber } from '@/lib/utils';
import { DURATION_PRESETS, WORD_COUNT_PRESETS } from '@/lib/constants';
import type { TypingResult, TestMode, TestDifficulty } from '@/types';
import { VirtualKeyboard } from '@/features/keyboard/VirtualKeyboard';
import {
  Clock, Hash, Quote, FileText, RotateCcw,
  Type, Gauge, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TypingTestPage() {
  const dispatch = useAppDispatch();
  const testConfig = useAppSelector((s) => s.typing.testConfig);
  const typingSettings = useAppSelector((s) => s.settings.settings.typing);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(async (completedResult: TypingResult) => {
    if (!completedResult.completed) return;
    setResult(completedResult);
    setShowResult(true);
    setShowConfig(false);
    dispatch(setLastResult(completedResult));

    // Persist to IndexedDB
    try {
      await sessionRepository.save(completedResult);
      // Update daily activity
      const dateKey = getDateKey();
      const activity = await activityRepository.getOrCreate(dateKey);
      activity.testsCompleted += 1;
      activity.practiceDurationMs += completedResult.durationMs;
      if (completedResult.wpm > activity.bestWpm) activity.bestWpm = completedResult.wpm;
      await activityRepository.update(activity);
    } catch (err) {
      console.error('Failed to save test result:', err);
    }
  }, [dispatch]);

  const engine = useTypingEngine({
    testConfig,
    onComplete: handleComplete,
    sessionType: 'test',
  });

  // Focus management
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showResult) return;
      if (document.activeElement === engine.inputRef.current) return;
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        engine.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [engine, showResult]);

  const handleRestart = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setShowConfig(true);
    engine.restart();
  }, [engine]);

  const handleNewTest = useCallback(() => {
    setShowResult(false);
    setResult(null);
    setShowConfig(true);
    engine.restart();
  }, [engine]);

  const setMode = (mode: TestMode) => {
    dispatch(setTestConfig({ mode }));
    engine.restart();
  };

  const setDuration = (duration: number) => {
    dispatch(setTestConfig({ duration }));
    engine.restart();
  };

  const setWordCount = (wordCount: number) => {
    dispatch(setTestConfig({ wordCount }));
    engine.restart();
  };

  const toggleOption = (key: 'punctuation' | 'numbers' | 'capitalization') => {
    dispatch(setTestConfig({ [key]: !testConfig[key] }));
    engine.restart();
  };

  const setDifficulty = (difficulty: TestDifficulty) => {
    dispatch(setTestConfig({ difficulty }));
    engine.restart();
  };

  const modes: { id: TestMode; label: string; icon: React.ElementType }[] = [
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'words', label: 'Words', icon: Hash },
    { id: 'quote', label: 'Quote', icon: Quote },
    { id: 'custom', label: 'Custom', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto" ref={containerRef}>
      <AnimatePresence mode="wait">
        {showResult && result ? (
          <motion.div key="result">
            <TestResult result={result} onRestart={handleRestart} onNewTest={handleNewTest} />
          </motion.div>
        ) : (
          <motion.div
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Test Configuration Bar */}
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-6"
              >
                {/* Mode Selection */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {modes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        testConfig.mode === id
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}

                  <div className="h-5 w-px bg-border mx-1" />

                  {/* Options */}
                  {['punctuation', 'numbers', 'capitalization'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt as 'punctuation' | 'numbers' | 'capitalization')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        testConfig[opt as keyof typeof testConfig]
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Duration/Word Count presets */}
                <div className="flex flex-wrap items-center gap-2">
                  {testConfig.mode === 'time' && DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        testConfig.duration === d
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      {d}s
                    </button>
                  ))}
                  {testConfig.mode === 'words' && WORD_COUNT_PRESETS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWordCount(w)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        testConfig.wordCount === w
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      {w}
                    </button>
                  ))}

                  <div className="h-5 w-px bg-border mx-1" />

                  {/* Difficulty */}
                  {(['easy', 'medium', 'hard', 'expert'] as TestDifficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                        testConfig.difficulty === d
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Live Stats */}
            {engine.state.isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-8 mb-4"
              >
                {typingSettings.showLiveWpm && (
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-accent">{engine.metrics.wpm}</div>
                    <div className="text-xs text-text-muted uppercase">WPM</div>
                  </div>
                )}
                {typingSettings.showLiveAccuracy && (
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-success">
                      {(engine.metrics.accuracy * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-text-muted uppercase">Accuracy</div>
                  </div>
                )}
                {typingSettings.showLiveTimer && engine.timeRemaining !== null && (
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-text-primary">{engine.timeRemaining}</div>
                    <div className="text-xs text-text-muted uppercase">Seconds</div>
                  </div>
                )}
                {typingSettings.showLiveProgress && (
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-info">
                      {(engine.metrics.progress * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-text-muted uppercase">Progress</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Typing Area */}
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

            {/* Virtual Keyboard */}
            <div className="mt-8">
              <VirtualKeyboard
                activeChar={engine.state.chars[engine.state.currentIndex]?.char}
              />
            </div>

            {/* Restart hint */}
            <div className="flex items-center justify-center mt-6 gap-6">
              <button
                onClick={handleRestart}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restart (Tab)
              </button>
              {engine.state.isPaused && (
                <button onClick={engine.resume} className="btn-primary text-sm">
                  Resume (Esc)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
