import { shuffleArray, pickRandom } from '@/lib/utils';
import { commonWords, advancedWords, sentences, programmingSnippets } from '@/data/wordlists';
import type { TestConfig, TestDifficulty } from '@/types';

/**
 * Text Generator
 * 
 * Generates target text based on test configuration.
 * Supports words, sentences, quotes, custom text, and code.
 */

function getWordList(difficulty: TestDifficulty): string[] {
  switch (difficulty) {
    case 'beginner':
      return commonWords.slice(0, 50);
    case 'easy':
      return commonWords.slice(0, 200);
    case 'medium':
      return commonWords;
    case 'hard':
      return [...commonWords, ...advancedWords.slice(0, 200)];
    case 'expert':
      return [...commonWords, ...advancedWords];
    case 'custom':
    default:
      return commonWords;
  }
}

function generateWords(config: TestConfig): string {
  const wordList = getWordList(config.difficulty);
  const count = config.mode === 'words' ? config.wordCount : Math.max(50, config.duration * 3);
  const words = pickRandom(wordList, Math.min(count, wordList.length));

  // If we need more words than available, repeat with shuffle
  while (words.length < count) {
    words.push(...pickRandom(wordList, Math.min(count - words.length, wordList.length)));
  }

  let result = words.slice(0, count);

  if (config.capitalization) {
    result = result.map((word, i) => {
      if (i === 0 || Math.random() < 0.15) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });
  }

  if (config.numbers) {
    const numberCount = Math.max(1, Math.floor(count * 0.1));
    for (let i = 0; i < numberCount; i++) {
      const pos = Math.floor(Math.random() * result.length);
      result[pos] = String(Math.floor(Math.random() * 10000));
    }
  }

  let text = result.join(' ');

  if (config.punctuation) {
    text = addPunctuation(text);
  }

  return text;
}

function addPunctuation(text: string): string {
  const words = text.split(' ');
  const punctuationMarks = ['.', ',', '!', '?', ';', ':'];
  const result: string[] = [];

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    // Add punctuation at roughly 15% of word boundaries
    if (i > 0 && Math.random() < 0.15) {
      const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      // Add to previous word
      if (result.length > 0) {
        result[result.length - 1] += mark;
      }
      // Capitalize next word after sentence-ending punctuation
      if (['.', '!', '?'].includes(mark)) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
    result.push(word);
  }

  // Ensure text ends with a period
  if (result.length > 0) {
    const lastWord = result[result.length - 1];
    if (!/[.!?]$/.test(lastWord)) {
      result[result.length - 1] = lastWord + '.';
    }
  }

  return result.join(' ');
}

function generateSentences(config: TestConfig): string {
  const count = config.mode === 'words'
    ? Math.max(1, Math.floor(config.wordCount / 8))
    : Math.max(3, Math.floor(config.duration / 10));

  const selected = pickRandom(sentences, Math.min(count, sentences.length));

  // Repeat if needed
  const result = [...selected];
  while (result.length < count) {
    result.push(...pickRandom(sentences, Math.min(count - result.length, sentences.length)));
  }

  return result.slice(0, count).join(' ');
}

function generateCode(config: TestConfig): string {
  const count = config.mode === 'words'
    ? Math.max(1, Math.floor(config.wordCount / 5))
    : Math.max(2, Math.floor(config.duration / 15));

  const selected = pickRandom(programmingSnippets, Math.min(count, programmingSnippets.length));
  return selected.join(' ');
}

export function generateText(config: TestConfig): string {
  if (config.customText && config.customText.trim().length > 0) {
    return config.customText.trim();
  }

  switch (config.textSource) {
    case 'sentences':
      return generateSentences(config);
    case 'code':
      return generateCode(config);
    case 'words':
    default:
      return generateWords(config);
  }
}

/**
 * Generate text specifically for a lesson.
 */
export function generateLessonText(targetKeys: string[], style: 'warmup' | 'practice' | 'challenge'): string {
  const baseWords = generateWordsFromKeys(targetKeys);
  const count = style === 'warmup' ? 10 : style === 'practice' ? 25 : 40;
  const words = pickRandom(baseWords, Math.min(count, baseWords.length));
  while (words.length < count) {
    words.push(...pickRandom(baseWords, Math.min(count - words.length, baseWords.length)));
  }
  return words.slice(0, count).join(' ');
}

function generateWordsFromKeys(keys: string[]): string[] {
  // Generate simple combinations of the target keys
  const words: string[] = [];
  const keySet = new Set(keys.map(k => k.toLowerCase()));

  // Filter common words that use only target keys
  const filtered = commonWords.filter(word =>
    word.split('').every(c => keySet.has(c))
  );

  if (filtered.length > 0) {
    words.push(...filtered);
  }

  // Also generate random combinations
  for (let i = 0; i < 20; i++) {
    const len = 2 + Math.floor(Math.random() * 4);
    let word = '';
    for (let j = 0; j < len; j++) {
      word += keys[Math.floor(Math.random() * keys.length)].toLowerCase();
    }
    words.push(word);
  }

  return words.length > 0 ? words : ['the', 'and', 'for', 'are', 'but', 'not', 'you'];
}
