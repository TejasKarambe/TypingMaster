import type { CharInfo, CharState, TypingEngineState, MetricsSample, TestConfig, TypingResult } from '@/types';
import { calculateWpm, calculateRawWpm, calculateAccuracy, calculateConsistency, shouldSampleMetrics, createMetricsSample } from './metrics';
import { generateId } from '@/lib/utils';
import { METRICS_SAMPLE_INTERVAL_MS } from '@/lib/constants';

/**
 * Core Typing Engine
 * 
 * A pure, framework-agnostic typing engine that manages:
 * - Target text and character states
 * - Input position tracking
 * - Correct/incorrect character tracking
 * - Error correction (backspace)
 * - Timing and pausing
 * - Metrics sampling
 * - Session completion
 * 
 * This engine is designed to be used by tests, lessons, and compatible games.
 * All React-specific logic (rendering, hooks) should be in separate adapters.
 */

export interface TypingEngineConfig {
  targetText: string;
  testConfig: TestConfig;
  backspaceEnabled: boolean;
  onComplete?: (result: TypingResult) => void;
}

export function createInitialChars(text: string): CharInfo[] {
  return text.split('').map(char => ({
    char,
    state: 'untyped' as CharState,
  }));
}

export function createInitialState(text: string): TypingEngineState {
  return {
    targetText: text,
    chars: createInitialChars(text),
    currentIndex: 0,
    startTime: null,
    endTime: null,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    correctCount: 0,
    incorrectCount: 0,
    correctedCount: 0,
    totalKeystrokes: 0,
    elapsedMs: 0,
    metrics: [],
    errorMap: {},
  };
}

/**
 * Process a single character input.
 * Returns a new state (immutable update).
 */
export function processCharInput(
  state: TypingEngineState,
  inputChar: string,
  timestamp: number,
  backspaceEnabled: boolean,
): TypingEngineState {
  if (state.isCompleted || state.isPaused) return state;

  const newState = { ...state };
  const chars = [...state.chars.map(c => ({ ...c }))];

  // Start timing on first input
  if (!newState.startTime) {
    newState.startTime = timestamp;
    newState.isRunning = true;
  }

  const currentIdx = newState.currentIndex;
  if (currentIdx >= chars.length) return state;

  newState.totalKeystrokes++;

  const targetChar = chars[currentIdx].char;
  const isCorrect = inputChar === targetChar;

  if (isCorrect) {
    // Check if this was previously incorrect and is now being corrected
    if (chars[currentIdx].state === 'incorrect') {
      chars[currentIdx].state = 'corrected';
      newState.correctedCount++;
      newState.incorrectCount = Math.max(0, newState.incorrectCount - 1);
      newState.correctCount++;
    } else {
      chars[currentIdx].state = 'correct';
      newState.correctCount++;
    }
    chars[currentIdx].typedChar = inputChar;
    chars[currentIdx].timestamp = timestamp;
    newState.currentIndex++;
  } else {
    chars[currentIdx].state = 'incorrect';
    chars[currentIdx].typedChar = inputChar;
    chars[currentIdx].timestamp = timestamp;
    newState.incorrectCount++;
    // Track error character
    const errorKey = targetChar;
    newState.errorMap = { ...state.errorMap };
    newState.errorMap[errorKey] = (newState.errorMap[errorKey] || 0) + 1;
    newState.currentIndex++;
  }

  // Update elapsed time
  newState.elapsedMs = timestamp - (newState.startTime || timestamp);

  // Sample metrics at intervals
  if (shouldSampleMetrics(
    state.metrics.length > 0 ? state.metrics[state.metrics.length - 1].elapsedMs : 0,
    newState.elapsedMs,
  )) {
    const sample = createMetricsSample(
      newState.elapsedMs,
      newState.correctCount,
      newState.totalKeystrokes,
      newState.correctCount + newState.incorrectCount,
      newState.incorrectCount,
    );
    newState.metrics = [...state.metrics, sample];
  }

  // Check completion
  if (newState.currentIndex >= chars.length) {
    newState.isCompleted = true;
    newState.isRunning = false;
    newState.endTime = timestamp;
  }

  newState.chars = chars;
  return newState;
}

/**
 * Process backspace input.
 * Returns a new state.
 */
export function processBackspace(
  state: TypingEngineState,
  backspaceEnabled: boolean,
): TypingEngineState {
  if (!backspaceEnabled || state.isCompleted || state.isPaused) return state;
  if (state.currentIndex <= 0) return state;

  const newState = { ...state };
  const chars = [...state.chars.map(c => ({ ...c }))];

  newState.currentIndex--;
  const prevChar = chars[newState.currentIndex];

  // If the previous character was incorrect, removing it is a correction
  if (prevChar.state === 'incorrect') {
    newState.correctedCount++;
    newState.incorrectCount = Math.max(0, newState.incorrectCount - 1);
  } else if (prevChar.state === 'correct') {
    newState.correctCount = Math.max(0, newState.correctCount - 1);
  }

  prevChar.state = 'untyped';
  prevChar.typedChar = undefined;
  prevChar.timestamp = undefined;

  newState.chars = chars;
  newState.totalKeystrokes++;
  return newState;
}

/**
 * Pause the engine. Freezes elapsed time.
 */
export function pauseEngine(state: TypingEngineState, timestamp: number): TypingEngineState {
  if (!state.isRunning || state.isCompleted || state.isPaused) return state;
  return {
    ...state,
    isPaused: true,
    isRunning: false,
    elapsedMs: timestamp - (state.startTime || timestamp),
  };
}

/**
 * Resume the engine. Adjusts start time to account for paused duration.
 */
export function resumeEngine(state: TypingEngineState, timestamp: number): TypingEngineState {
  if (!state.isPaused || state.isCompleted) return state;
  // Adjust startTime so that elapsedMs stays continuous
  const newStartTime = timestamp - state.elapsedMs;
  return {
    ...state,
    isPaused: false,
    isRunning: true,
    startTime: newStartTime,
  };
}

/**
 * Update elapsed time (for timer-based tests).
 */
export function updateElapsed(state: TypingEngineState, timestamp: number): TypingEngineState {
  if (!state.isRunning || state.isPaused || !state.startTime) return state;
  return {
    ...state,
    elapsedMs: timestamp - state.startTime,
  };
}

/**
 * Force complete the engine (for time-based tests).
 */
export function forceComplete(state: TypingEngineState, timestamp: number): TypingEngineState {
  if (state.isCompleted) return state;
  return {
    ...state,
    isCompleted: true,
    isRunning: false,
    isPaused: false,
    endTime: timestamp,
    elapsedMs: state.startTime ? timestamp - state.startTime : state.elapsedMs,
  };
}

/**
 * Reset the engine to initial state.
 */
export function resetEngine(targetText: string): TypingEngineState {
  return createInitialState(targetText);
}

/**
 * Get current computed metrics from state.
 */
export function getCurrentMetrics(state: TypingEngineState) {
  const totalAttempted = state.correctCount + state.incorrectCount;
  return {
    wpm: calculateWpm(state.correctCount, state.elapsedMs),
    rawWpm: calculateRawWpm(state.totalKeystrokes, state.elapsedMs),
    accuracy: calculateAccuracy(state.correctCount, totalAttempted),
    correctChars: state.correctCount,
    incorrectChars: state.incorrectCount,
    correctedErrors: state.correctedCount,
    uncorrectedErrors: state.chars.filter(c => c.state === 'incorrect').length,
    totalChars: totalAttempted,
    progress: state.targetText.length > 0 ? state.currentIndex / state.targetText.length : 0,
    consistency: calculateConsistency(state.metrics),
    elapsedMs: state.elapsedMs,
  };
}

/**
 * Create a TypingResult from the completed engine state.
 */
export function createResult(
  state: TypingEngineState,
  testConfig: TestConfig,
  sessionType: 'test' | 'lesson' | 'game' | 'practice',
  previousBestWpm: number = 0,
): TypingResult {
  const metrics = getCurrentMetrics(state);
  return {
    id: generateId(),
    sessionType,
    mode: testConfig.mode,
    startedAt: state.startTime || Date.now(),
    completedAt: state.endTime || Date.now(),
    durationMs: state.elapsedMs,
    targetText: state.targetText,
    wpm: metrics.wpm,
    rawWpm: metrics.rawWpm,
    accuracy: metrics.accuracy,
    correctChars: metrics.correctChars,
    incorrectChars: metrics.incorrectChars,
    correctedErrors: metrics.correctedErrors,
    uncorrectedErrors: metrics.uncorrectedErrors,
    totalChars: metrics.totalChars,
    consistency: metrics.consistency,
    configSnapshot: testConfig,
    completed: state.isCompleted,
    personalBest: metrics.wpm > previousBestWpm && metrics.wpm > 0,
    metrics: state.metrics,
    errorMap: state.errorMap,
  };
}
