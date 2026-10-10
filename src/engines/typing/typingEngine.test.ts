import { describe, it, expect } from 'vitest';
import {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateErrorRate,
  calculateConsistency
} from './metrics';
import {
  createInitialState,
  processCharInput,
  processBackspace,
  getCurrentMetrics
} from './typingEngine';

describe('Typing Metrics', () => {
  it('calculates standard net WPM correctly (5 chars per word)', () => {
    // 50 correct characters in 1 minute = 10 WPM
    expect(calculateWpm(50, 60000)).toBe(10);
    // 100 correct characters in 30 seconds (0.5 min) = 40 WPM
    expect(calculateWpm(100, 30000)).toBe(40);
  });

  it('handles zero or negative duration safely', () => {
    expect(calculateWpm(50, 0)).toBe(0);
    expect(calculateRawWpm(50, -100)).toBe(0);
  });

  it('calculates accuracy accurately', () => {
    expect(calculateAccuracy(95, 100)).toBe(0.95);
    expect(calculateAccuracy(100, 100)).toBe(1);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('calculates consistency score', () => {
    const consistentSamples = [
      { elapsedMs: 1000, wpm: 50, rawWpm: 50, accuracy: 1, errorCount: 0 },
      { elapsedMs: 2000, wpm: 50, rawWpm: 50, accuracy: 1, errorCount: 0 },
      { elapsedMs: 3000, wpm: 50, rawWpm: 50, accuracy: 1, errorCount: 0 },
    ];
    expect(calculateConsistency(consistentSamples)).toBe(100);
  });
});

describe('Typing Engine', () => {
  it('initializes state with untyped characters', () => {
    const state = createInitialState('hello');
    expect(state.chars).toHaveLength(5);
    expect(state.chars[0].char).toBe('h');
    expect(state.chars[0].state).toBe('untyped');
    expect(state.currentIndex).toBe(0);
    expect(state.isCompleted).toBe(false);
  });

  it('processes correct and incorrect characters', () => {
    let state = createInitialState('test');
    const t0 = 1000;
    
    // Type 't' (correct)
    state = processCharInput(state, 't', t0, true);
    expect(state.chars[0].state).toBe('correct');
    expect(state.correctCount).toBe(1);
    expect(state.currentIndex).toBe(1);

    // Type 'x' instead of 'e' (incorrect)
    state = processCharInput(state, 'x', t0 + 100, true);
    expect(state.chars[1].state).toBe('incorrect');
    expect(state.incorrectCount).toBe(1);
    expect(state.currentIndex).toBe(2);
  });

  it('handles backspace correctly', () => {
    let state = createInitialState('word');
    state = processCharInput(state, 'x', 1000, true); // wrong char
    expect(state.currentIndex).toBe(1);
    expect(state.incorrectCount).toBe(1);

    // Backspace
    state = processBackspace(state, true);
    expect(state.currentIndex).toBe(0);
    expect(state.chars[0].state).toBe('untyped');
    expect(state.incorrectCount).toBe(0);
    expect(state.correctedCount).toBe(1);
  });

  it('completes session when reaching end of text', () => {
    let state = createInitialState('hi');
    state = processCharInput(state, 'h', 1000, true);
    state = processCharInput(state, 'i', 1200, true);
    expect(state.isCompleted).toBe(true);
    expect(state.isRunning).toBe(false);
  });
});
