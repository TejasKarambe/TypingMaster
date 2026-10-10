import { WPM_WORD_LENGTH, METRICS_SAMPLE_INTERVAL_MS } from '@/lib/constants';
import type { MetricsSample } from '@/types';

/**
 * Typing Metrics Calculator
 * 
 * Central module for all typing performance calculations.
 * Uses standard 5-character word convention for WPM.
 * 
 * WPM = (correct characters / 5) / elapsed minutes
 * Raw WPM = (total keystrokes / 5) / elapsed minutes
 * Accuracy = correct characters / total attempted characters
 * Consistency = 100 - coefficient of variation of inter-keystroke intervals
 */

export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  if (minutes <= 0) return 0;
  return Math.round((correctChars / WPM_WORD_LENGTH) / minutes);
}

export function calculateRawWpm(totalKeystrokes: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  if (minutes <= 0) return 0;
  return Math.round((totalKeystrokes / WPM_WORD_LENGTH) / minutes);
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 0;
  return Math.min(1, correctChars / totalChars);
}

export function calculateErrorRate(incorrectChars: number, totalChars: number): number {
  if (totalChars <= 0) return 0;
  return incorrectChars / totalChars;
}

/**
 * Consistency is based on the coefficient of variation of WPM samples.
 * Higher consistency means more uniform typing speed.
 * Returns a value from 0-100.
 */
export function calculateConsistency(metrics: MetricsSample[]): number {
  if (metrics.length < 2) return 100;
  const wpmValues = metrics.map(m => m.wpm).filter(w => w > 0);
  if (wpmValues.length < 2) return 100;

  const mean = wpmValues.reduce((sum, v) => sum + v, 0) / wpmValues.length;
  if (mean === 0) return 0;

  const variance = wpmValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / wpmValues.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;

  // Invert: low CV = high consistency
  return Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation)));
}

/**
 * Determine if a new sample should be recorded based on time elapsed since last sample.
 */
export function shouldSampleMetrics(lastSampleMs: number, currentMs: number): boolean {
  return (currentMs - lastSampleMs) >= METRICS_SAMPLE_INTERVAL_MS;
}

/**
 * Create a metrics sample at the current state.
 */
export function createMetricsSample(
  elapsedMs: number,
  correctChars: number,
  totalKeystrokes: number,
  totalAttempted: number,
  errorCount: number,
): MetricsSample {
  return {
    elapsedMs,
    wpm: calculateWpm(correctChars, elapsedMs),
    rawWpm: calculateRawWpm(totalKeystrokes, elapsedMs),
    accuracy: calculateAccuracy(correctChars, totalAttempted),
    errorCount,
  };
}

/**
 * Calculate average inter-keystroke interval in milliseconds.
 */
export function calculateAvgKeystrokeInterval(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  return intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
}

/**
 * Find the most problematic characters from error map.
 */
export function getProblematicChars(errorMap: Record<string, number>, limit = 5): Array<{ char: string; count: number }> {
  return Object.entries(errorMap)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Check if the result is a personal best WPM.
 */
export function isPersonalBest(currentWpm: number, previousBestWpm: number): boolean {
  return currentWpm > previousBestWpm && currentWpm > 0;
}
