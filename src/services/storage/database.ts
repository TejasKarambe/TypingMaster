import Dexie, { type Table } from 'dexie';

export interface DBSettings {
  id: number;
  settings: string; // JSON stringified AppSettings
  updatedAt: number;
}

export interface DBTypingSession {
  id?: number;
  sessionId: string;
  sessionType: string;
  mode: string;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  targetText: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  totalChars: number;
  consistency: number;
  configSnapshot: string; // JSON
  completed: boolean;
  personalBest: boolean;
  metrics: string; // JSON
  errorMap: string; // JSON
}

export interface DBLessonProgress {
  id?: number;
  lessonId: string;
  attempts: number;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  latestWpm: number;
  latestAccuracy: number;
  stars: number;
  completedAt?: number;
  updatedAt: number;
}

export interface DBGameRecord {
  id?: number;
  gameId: string;
  startedAt: number;
  completedAt: number;
  score: number;
  level: number;
  wpm: number;
  accuracy: number;
  durationMs: number;
  difficulty: string;
  configSnapshot: string; // JSON
}

export interface DBAchievement {
  id?: number;
  achievementId: string;
  unlockedAt: number;
  metadata?: string; // JSON
}

export interface DBDailyActivity {
  id?: number;
  dateKey: string;
  practiceDurationMs: number;
  testsCompleted: number;
  lessonsCompleted: number;
  gamesPlayed: number;
  xpEarned: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
}

export interface DBCustomText {
  id?: number;
  name: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface DBCustomWordList {
  id?: number;
  name: string;
  words: string; // JSON array
  createdAt: number;
  updatedAt: number;
}

export class TypingMasterDB extends Dexie {
  settings!: Table<DBSettings, number>;
  typingSessions!: Table<DBTypingSession, number>;
  lessonProgress!: Table<DBLessonProgress, number>;
  gameRecords!: Table<DBGameRecord, number>;
  achievements!: Table<DBAchievement, number>;
  dailyActivity!: Table<DBDailyActivity, number>;
  customTexts!: Table<DBCustomText, number>;
  customWordLists!: Table<DBCustomWordList, number>;

  constructor() {
    super('typing-master-db');
    this.version(1).stores({
      settings: 'id, updatedAt',
      typingSessions: '++id, sessionId, sessionType, mode, startedAt, completedAt, completed',
      lessonProgress: '++id, &lessonId, completed, updatedAt',
      gameRecords: '++id, gameId, startedAt, completedAt, difficulty',
      achievements: '++id, &achievementId, unlockedAt',
      dailyActivity: '++id, &dateKey',
      customTexts: '++id, name, category, createdAt',
      customWordLists: '++id, name, createdAt',
    });
  }
}

export const db = new TypingMasterDB();
