import { useCallback, useEffect, useRef, useState } from 'react';
import type { TestConfig, TypingEngineState, TypingResult } from '@/types';
import {
  createInitialState,
  processCharInput,
  processBackspace,
  pauseEngine,
  resumeEngine,
  forceComplete,
  resetEngine,
  getCurrentMetrics,
  createResult,
} from '@/engines/typing/typingEngine';
import { generateText } from '@/engines/typing/textGenerator';
import { useAppSelector } from '@/app/store/hooks';
import { soundService } from '@/services/audio/soundService';

interface UseTypingEngineOptions {
  testConfig: TestConfig;
  customText?: string;
  onComplete?: (result: TypingResult) => void;
  previousBestWpm?: number;
  sessionType?: 'test' | 'lesson' | 'game' | 'practice';
}

export function useTypingEngine(options: UseTypingEngineOptions) {
  const { testConfig, customText, onComplete, previousBestWpm = 0, sessionType = 'test' } = options;
  const typingSettings = useAppSelector((s) => s.settings.settings.typing);
  const soundSettings = useAppSelector((s) => s.settings.settings.sound);

  const [state, setState] = useState<TypingEngineState>(() => {
    const text = customText || generateText(testConfig);
    return createInitialState(text);
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer for time-based mode
  useEffect(() => {
    if (state.isRunning && !state.isPaused && testConfig.mode === 'time') {
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const currentState = stateRef.current;
        if (currentState.startTime && !currentState.isCompleted) {
          const elapsed = now - currentState.startTime;
          if (elapsed >= testConfig.duration * 1000) {
            setState((prev) => forceComplete(prev, now));
          }
        }
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isRunning, state.isPaused, testConfig.mode, testConfig.duration]);

  // Handle completion
  useEffect(() => {
    if (state.isCompleted && !completedRef.current) {
      completedRef.current = true;
      const result = createResult(state, testConfig, sessionType, previousBestWpm);
      onComplete?.(result);
    }
  }, [state.isCompleted, testConfig, sessionType, previousBestWpm, onComplete, state]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (stateRef.current.isCompleted) return;

    if (e.key === 'Escape') {
      if (stateRef.current.isRunning && !stateRef.current.isPaused) {
        setState((prev) => pauseEngine(prev, performance.now()));
      } else if (stateRef.current.isPaused) {
        setState((prev) => resumeEngine(prev, performance.now()));
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      setState((prev) => processBackspace(prev, typingSettings.backspaceEnabled));
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      restart();
      return;
    }

    // Only process printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const now = performance.now();
      const targetChar = stateRef.current.chars[stateRef.current.currentIndex]?.char;
      const isCorrect = e.key === targetChar;

      if (soundSettings.masterEnabled) {
        if (!isCorrect && soundSettings.errorSound) {
          soundService.playErrorSound(soundSettings.volume);
        } else if (soundSettings.typingEnabled || soundSettings.correctSound) {
          soundService.playKeySound(soundSettings.soundProfile, soundSettings.volume);
        }
      }

      setState((prev) => processCharInput(prev, e.key, now, typingSettings.backspaceEnabled));
    }
  }, [typingSettings.backspaceEnabled, soundSettings]);

  const restart = useCallback((newText?: string) => {
    completedRef.current = false;
    const text = newText || customText || generateText(testConfig);
    setState(resetEngine(text));
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Re-focus input
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [customText, testConfig]);

  const pause = useCallback(() => {
    setState((prev) => pauseEngine(prev, performance.now()));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => resumeEngine(prev, performance.now()));
    inputRef.current?.focus();
  }, []);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const metrics = getCurrentMetrics(state);

  const timeRemaining = testConfig.mode === 'time' && state.startTime
    ? Math.max(0, testConfig.duration - Math.floor(state.elapsedMs / 1000))
    : null;

  return {
    state,
    metrics,
    timeRemaining,
    handleKeyDown,
    restart,
    pause,
    resume,
    focus,
    inputRef,
  };
}
