# Data Model: Typing Master

This document defines the core data structures and TypeScript interfaces used throughout the application and for the Dexie (IndexedDB) database schema.

## Settings
```typescript
interface Settings {
  id?: number; // Singleton, id is usually 1
  appearance: {
    theme: string;
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    caretStyle: 'line' | 'block' | 'underline' | 'outline';
    smoothCaret: boolean;
  };
  typing: {
    mode: 'time' | 'words' | 'custom';
    duration: number; // in seconds
    wordCount: number;
    language: string;
    blindMode: boolean;
    confidenceMode: 'off' | 'on' | 'max'; // e.g., max disallows backspace
  };
  sound: {
    enabled: boolean;
    volume: number;
    clickSound: string;
    errorSound: string;
  };
}
```

## TypingSession & SessionMetrics
```typescript
interface SessionMetrics {
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

interface TypingSession {
  id?: string; // UUID
  createdAt: number; // Unix timestamp
  mode: 'time' | 'words' | 'custom' | 'lesson';
  duration: number; // Actual time taken
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  testLanguage: string;
  history: SessionMetrics[]; // Time-series samples taken every second
}
```

## LessonProgress
```typescript
interface LessonProgress {
  lessonId: string;
  completed: boolean;
  stars: number; // 0-3 based on performance
  highScoreWpm: number;
  highScoreAccuracy: number;
  lastAttemptedAt: number;
}
```

## GameRecord
```typescript
interface GameRecord {
  id?: string;
  gameId: string;
  playedAt: number;
  score: number;
  duration: number;
  metadata?: any; // Game-specific metrics (e.g. max level reached)
}
```

## CustomText and CustomWordList
```typescript
interface CustomWordList {
  id?: string;
  title: string;
  words: string[];
  createdAt: number;
  updatedAt: number;
}

interface CustomText {
  id?: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

## Achievement
```typescript
interface Achievement {
  id: string; // e.g., 'speed_demon_100'
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}
```

## DailyActivity
```typescript
interface DailyActivity {
  date: string; // YYYY-MM-DD
  timeSpent: number; // Seconds
  testsCompleted: number;
  averageWpm: number;
}
```

## Theme Configuration
```typescript
interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string; // Accent color
    secondary: string;
    error: string;
    correct: string;
    subtext: string;
  };
}
```

## Lesson/Curriculum Data Structures
```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: string; // The text to type
  passingCriteria: {
    minWpm: number;
    minAccuracy: number;
  };
}
```

## Game Configuration Types
```typescript
interface GameConfig {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  componentName: string;
}
```
