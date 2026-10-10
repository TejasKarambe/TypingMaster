import type { GameMetadata } from '@/types';

export const gameMetadata: GameMetadata[] = [
  {
    id: 'falling-words',
    title: 'Word Stream',
    description: 'Cyberpunk neon data rain. Intercept and type descending matrix words before they breach your digital defenses.',
    instructions: 'Words cascade down the neon data stream. Type each word accurately to vaporize it before it crosses the bottom defense perimeter. Build streaks for score multipliers.',
    icon: 'ArrowDown',
    color: '#06b6d4',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'typing-survival',
    title: 'Time Bomb Defusal',
    description: 'Ticking explosives with custom countdown fuses. Type fast to cut the wires before detonation.',
    instructions: 'Multiple bombs spawn with visual countdown fuses. Prioritize the most critical bombs and type their defusal codes before they reach zero!',
    icon: 'Bomb',
    color: '#ef4444',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'word-defender',
    title: 'Word Invaders',
    description: 'Retro arcade alien word squadrons descending from deep space. Lock on orbital lasers and vaporize waves.',
    instructions: 'Alien word fleets march back and forth, descending towards your base shields. Type words to aim your laser cannon and eliminate entire squadrons.',
    icon: 'Crosshair',
    color: '#a855f7',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'type-racer',
    title: 'Anagram Racer',
    description: 'Scrambled anagram puzzle challenge. Decipher the jumbled letter tiles against an aggressive countdown.',
    instructions: 'Unscramble each cluster of letter tiles. Type the decoded English word and press [ENTER]. Solving quickly awards bonus seconds on your clock!',
    icon: 'HelpCircle',
    color: '#6366f1',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
  {
    id: 'sentence-sprint',
    title: 'Word Chain',
    description: 'Continuous domino word linking. Form words where each new link starts with the previous word’s final letter.',
    instructions: 'Build an unbroken chain of vocabulary! Type any valid word starting with the required target letter and hit [ENTER] before the link timer runs out.',
    icon: 'Target',
    color: '#10b981',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
  {
    id: 'accuracy-challenge',
    title: 'Precision Trial',
    description: 'High-stakes sudden death test. Zero mistakes permitted—one erroneous keystroke ends the run.',
    instructions: 'Advance through progressively complex vocabulary. Accuracy must be 100% flawless; a single mistake causes immediate failure.',
    icon: 'Award',
    color: '#22c55e',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
];

export function getGameMetadata(gameId: string): GameMetadata | undefined {
  return gameMetadata.find((g) => g.id === gameId);
}
