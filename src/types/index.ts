// ============= SETTINGS TYPES =============
export type ThemeId = 'midnight' | 'graphite' | 'paper' | 'forest' | 'ocean' | 'sunset' | 'neon' | 'lavender' | 'monochrome' | 'high-contrast';

export type CaretStyle = 'line' | 'block' | 'underline' | 'outline';
export type CaretAnimation = 'none' | 'smooth' | 'blink' | 'pulse';
export type TestStartMode = 'immediate' | 'on-first-key' | 'countdown';
export type FontFamily = 'mono' | 'sans' | 'serif';
export type SoundProfile = 'mechanical' | 'typewriter' | 'soft' | 'click' | 'none';

export interface AppearanceSettings {
  themeId: ThemeId;
  accentColor: string;
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: number;
  typingAreaWidth: number;
  lineHeight: number;
  letterSpacing: number;
  borderRadius: number;
  animationIntensity: number; // 0-1
  keyboardVisible: boolean;
  statsVisible: boolean;
  compactMode: boolean;
}

export interface TypingSettings {
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  smoothCaret: boolean;
  testStartMode: TestStartMode;
  backspaceEnabled: boolean;
  blindMode: boolean;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showLiveErrors: boolean;
  showLiveTimer: boolean;
  showLiveProgress: boolean;
  showLiveGraph: boolean;
  autoNextTest: boolean;
  errorHighlighting: boolean;
  soundOnCorrect: boolean;
  soundOnError: boolean;
}

export interface SoundSettings {
  masterEnabled: boolean;
  typingEnabled: boolean;
  correctSound: boolean;
  errorSound: boolean;
  gameEffects: boolean;
  achievementSounds: boolean;
  volume: number; // 0-1
  soundProfile: SoundProfile;
  muteOnTest: boolean;
}

export interface GeneralSettings {
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  language: string;
  sidebarCollapsed: boolean;
  showOnboarding: boolean;
}

export interface AppSettings {
  appearance: AppearanceSettings;
  typing: TypingSettings;
  sound: SoundSettings;
  general: GeneralSettings;
}

// ============= TEST & SESSION TYPES =============
export type TestMode = 'time' | 'words' | 'quote' | 'custom' | 'zen';
export type TestDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'custom';
export type SessionType = 'test' | 'lesson' | 'game' | 'practice';

export interface TestConfig {
  mode: TestMode;
  duration: number; // seconds for time mode
  wordCount: number; // for word mode
  difficulty: TestDifficulty;
  punctuation: boolean;
  numbers: boolean;
  symbols: boolean;
  capitalization: boolean;
  language: string;
  textSource: string;
  quoteLength: 'short' | 'medium' | 'long' | 'all';
  customText?: string;
}

export type CharState = 'untyped' | 'correct' | 'incorrect' | 'corrected' | 'cursor' | 'skipped';

export interface CharInfo {
  char: string;
  state: CharState;
  typedChar?: string;
  timestamp?: number;
}

export interface MetricsSample {
  elapsedMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorCount: number;
}

export interface TypingResult {
  id: string;
  sessionType: SessionType;
  mode: TestMode;
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
  configSnapshot: TestConfig;
  completed: boolean;
  personalBest: boolean;
  metrics: MetricsSample[];
  errorMap: Record<string, number>; // char -> count
}

// ============= TYPING ENGINE TYPES =============
export interface TypingEngineState {
  targetText: string;
  chars: CharInfo[];
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  correctCount: number;
  incorrectCount: number;
  correctedCount: number;
  totalKeystrokes: number;
  elapsedMs: number;
  metrics: MetricsSample[];
  errorMap: Record<string, number>;
}

// ============= LESSON TYPES =============
export type LessonCategory = 'home-row' | 'upper-row' | 'lower-row' | 'common-words' | 'capitalization' | 'punctuation' | 'numbers-symbols' | 'sentence-fluency' | 'advanced' | 'expert';

export interface LessonData {
  id: string;
  levelId: string;
  levelNumber: number;
  title: string;
  description: string;
  objective: string;
  instructions: string;
  category: LessonCategory;
  targetKeys: string[];
  order: number;
  prerequisiteIds: string[];
  requiredAccuracy: number;
  requiredWpm?: number;
  warmupText: string;
  practiceText: string;
  challengeText: string;
  xpReward: number;
}

export interface LevelData {
  id: string;
  number: number;
  title: string;
  description: string;
  category: LessonCategory;
  lessons: LessonData[];
}

export interface LessonProgress {
  id?: number;
  lessonId: string;
  attempts: number;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  latestWpm: number;
  latestAccuracy: number;
  stars: number; // 0-3
  completedAt?: number;
  updatedAt: number;
}

// ============= GAME TYPES =============
export type GameId = 'falling-words' | 'type-racer' | 'word-defender' | 'typing-survival' | 'accuracy-challenge' | 'sentence-sprint';
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'endless';

export interface GameConfig {
  gameId: GameId;
  difficulty: GameDifficulty;
  duration?: number;
}

export interface GameMetadata {
  id: GameId;
  title: string;
  description: string;
  instructions: string;
  icon: string;
  color: string;
  minDifficulty: GameDifficulty;
  maxDifficulty: GameDifficulty;
}

export interface GameRecord {
  id?: number;
  gameId: GameId;
  startedAt: number;
  completedAt: number;
  score: number;
  level: number;
  wpm: number;
  accuracy: number;
  durationMs: number;
  difficulty: GameDifficulty;
  configSnapshot: GameConfig;
}

export interface GameState {
  gameId: GameId;
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  level: number;
  lives: number;
  combo: number;
  maxCombo: number;
  wordsCompleted: number;
  wordsTotal: number;
  accuracy: number;
  wpm: number;
  elapsedMs: number;
  currentInput: string;
}

// ============= ACHIEVEMENT TYPES =============
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'milestone' | 'games' | 'lessons' | 'streak';
  condition: (stats: UserStats) => boolean;
  xpReward: number;
}

export interface AchievementRecord {
  id?: number;
  achievementId: string;
  unlockedAt: number;
  metadata?: Record<string, unknown>;
}

// ============= ANALYTICS TYPES =============
export interface DailyActivity {
  id?: number;
  dateKey: string; // YYYY-MM-DD
  practiceDurationMs: number;
  testsCompleted: number;
  lessonsCompleted: number;
  gamesPlayed: number;
  xpEarned: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
}

export interface UserStats {
  totalTests: number;
  totalLessons: number;
  totalGames: number;
  totalPracticeMs: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalCharsTyped: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
}

// ============= THEME TYPES =============
export interface ThemeTokens {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  border: string;
  borderHover: string;
  correct: string;
  incorrect: string;
  cursor: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  tokens: ThemeTokens;
}

// ============= CUSTOM TEXT TYPES =============
export interface CustomText {
  id?: number;
  name: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomWordList {
  id?: number;
  name: string;
  words: string[];
  createdAt: number;
  updatedAt: number;
}

// ============= BACKUP/EXPORT TYPES =============
export interface BackupData {
  version: string;
  exportedAt: number;
  appVersion: string;
  settings: AppSettings;
  typingResults: TypingResult[];
  lessonProgress: LessonProgress[];
  gameRecords: GameRecord[];
  achievements: AchievementRecord[];
  dailyActivity: DailyActivity[];
  customTexts: CustomText[];
  customWordLists: CustomWordList[];
}
