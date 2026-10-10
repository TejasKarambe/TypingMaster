import { db } from '../database';
import type { TypingResult, MetricsSample, TestConfig } from '@/types';
import type { DBTypingSession } from '../database';

function toDBSession(result: TypingResult): Omit<DBTypingSession, 'id'> {
  return {
    sessionId: result.id,
    sessionType: result.sessionType,
    mode: result.mode,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    durationMs: result.durationMs,
    targetText: result.targetText,
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    correctChars: result.correctChars,
    incorrectChars: result.incorrectChars,
    correctedErrors: result.correctedErrors,
    uncorrectedErrors: result.uncorrectedErrors,
    totalChars: result.totalChars,
    consistency: result.consistency,
    configSnapshot: JSON.stringify(result.configSnapshot),
    completed: result.completed,
    personalBest: result.personalBest,
    metrics: JSON.stringify(result.metrics),
    errorMap: JSON.stringify(result.errorMap),
  };
}

function fromDBSession(row: DBTypingSession): TypingResult {
  return {
    id: row.sessionId,
    sessionType: row.sessionType as TypingResult['sessionType'],
    mode: row.mode as TypingResult['mode'],
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    durationMs: row.durationMs,
    targetText: row.targetText,
    wpm: row.wpm,
    rawWpm: row.rawWpm,
    accuracy: row.accuracy,
    correctChars: row.correctChars,
    incorrectChars: row.incorrectChars,
    correctedErrors: row.correctedErrors,
    uncorrectedErrors: row.uncorrectedErrors,
    totalChars: row.totalChars,
    consistency: row.consistency,
    configSnapshot: JSON.parse(row.configSnapshot) as TestConfig,
    completed: row.completed,
    personalBest: row.personalBest,
    metrics: JSON.parse(row.metrics) as MetricsSample[],
    errorMap: JSON.parse(row.errorMap) as Record<string, number>,
  };
}

export const sessionRepository = {
  async save(result: TypingResult): Promise<void> {
    try {
      // Check for duplicate session
      const existing = await db.typingSessions.where('sessionId').equals(result.id).first();
      if (existing) return; // Don't duplicate
      await db.typingSessions.add(toDBSession(result));
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Failed to save typing session');
    }
  },

  async getById(sessionId: string): Promise<TypingResult | null> {
    try {
      const row = await db.typingSessions.where('sessionId').equals(sessionId).first();
      if (!row) return null;
      return fromDBSession(row);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  async getAll(options?: {
    limit?: number;
    offset?: number;
    sessionType?: string;
    mode?: string;
    completed?: boolean;
    sortBy?: 'startedAt' | 'wpm' | 'accuracy';
    sortDir?: 'asc' | 'desc';
  }): Promise<TypingResult[]> {
    try {
      let collection = db.typingSessions.orderBy('startedAt');
      if (options?.sortDir === 'asc') {
        // Already ascending by default
      } else {
        collection = collection.reverse();
      }
      let results = await collection.toArray();
      if (options?.sessionType) {
        results = results.filter(r => r.sessionType === options.sessionType);
      }
      if (options?.mode) {
        results = results.filter(r => r.mode === options.mode);
      }
      if (options?.completed !== undefined) {
        results = results.filter(r => r.completed === options.completed);
      }
      if (options?.offset) {
        results = results.slice(options.offset);
      }
      if (options?.limit) {
        results = results.slice(0, options.limit);
      }
      return results.map(fromDBSession);
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  },

  async getCount(): Promise<number> {
    try {
      return await db.typingSessions.count();
    } catch (error) {
      console.error('Failed to count sessions:', error);
      return 0;
    }
  },

  async getBestWpm(): Promise<number> {
    try {
      const sessions = await db.typingSessions
        .where('completed').equals(1)
        .toArray();
      if (sessions.length === 0) return 0;
      return Math.max(...sessions.map(s => s.wpm));
    } catch (error) {
      console.error('Failed to get best WPM:', error);
      return 0;
    }
  },

  async delete(sessionId: string): Promise<void> {
    try {
      await db.typingSessions.where('sessionId').equals(sessionId).delete();
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error('Failed to delete session');
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.typingSessions.clear();
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      throw new Error('Failed to clear sessions');
    }
  },

  async getRecentSessions(limit: number = 10): Promise<TypingResult[]> {
    try {
      const rows = await db.typingSessions
        .orderBy('startedAt')
        .reverse()
        .limit(limit)
        .toArray();
      return rows.map(fromDBSession);
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  },
};
