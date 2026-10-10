import type { GameMetadata } from '@/types';

export const gameMetadata: GameMetadata[] = [
  {
    id: 'falling-words',
    title: 'Falling Words',
    description: 'Type words before they reach the bottom. Speed increases as you progress through levels.',
    instructions: 'Words fall from the top of the screen. Type each word correctly to destroy it before it reaches the bottom. Complete words earn points and combos. Missing words costs lives.',
    icon: 'ArrowDown',
    color: '#38bdf8',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'type-racer',
    title: 'Type Racer',
    description: 'Race your car by typing text accurately. Beat your personal best or challenge the AI.',
    instructions: 'Type the displayed text to move your car forward. Accuracy and speed determine your position. Complete the race to see your results.',
    icon: 'Car',
    color: '#f97316',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
  {
    id: 'word-defender',
    title: 'Word Defender',
    description: 'Defend your base from incoming word waves. Type to eliminate threats.',
    instructions: 'Words approach your defense line from the right. Type them to eliminate the threat. Survive waves of increasing difficulty. Special bonus words give extra points.',
    icon: 'Shield',
    color: '#a855f7',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'typing-survival',
    title: 'Typing Survival',
    description: 'How long can you survive? Words get harder and faster over time.',
    instructions: 'Type words as they appear to stay alive. Build combos for bonus points. Each mistake costs health. Survive as long as possible.',
    icon: 'Heart',
    color: '#ef4444',
    minDifficulty: 'easy',
    maxDifficulty: 'endless',
  },
  {
    id: 'accuracy-challenge',
    title: 'Accuracy Challenge',
    description: 'Precision over speed. Can you type with perfect accuracy?',
    instructions: 'Complete multiple rounds of typing challenges. Accuracy is weighted more heavily than speed. Each mistake reduces your score significantly. Earn medals based on precision.',
    icon: 'Target',
    color: '#22c55e',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
  {
    id: 'sentence-sprint',
    title: 'Sentence Sprint',
    description: 'Speed through sentences one at a time. Beat the clock and your personal best.',
    instructions: 'Complete sentences as quickly and accurately as possible. Each sentence increases in difficulty. Track your WPM and accuracy across all sentences.',
    icon: 'Zap',
    color: '#eab308',
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
  },
];

export function getGameMetadata(gameId: string): GameMetadata | undefined {
  return gameMetadata.find(g => g.id === gameId);
}
