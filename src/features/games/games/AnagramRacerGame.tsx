import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, HelpCircle, Trophy, RefreshCw, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface AnagramRacerProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const AnagramRacerGame: React.FC<AnagramRacerProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [inputBuffer, setInputBuffer] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const solvedCount = useRef(0);

  const scramble = (str: string) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const res = arr.join('');
    return res === str ? scramble(str) : res;
  };

  const nextWord = () => {
    // Pick word with increasing complexity
    const eligibleWords = commonWords.filter((w) => w.length >= 4 && w.length <= 8);
    const word = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setInputBuffer('');
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setRound(1);
    setTimeLeft(60);
    setStreak(0);
    setInputBuffer('');
    solvedCount.current = 0;
    startTime.current = performance.now();
    nextWord();
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
          setIsPlaying(false);
          const wpm = solvedCount.current * 8; // approx WPM based on unscrambles
          onGameOver(score, round, wpm);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isPlaying, onGameOver, round, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      if (e.key === 'Backspace') {
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === 'Escape') {
        setInputBuffer('');
        return;
      }

      if (e.key === 'Enter') {
        if (inputBuffer.toLowerCase() === currentWord.toLowerCase()) {
          // Solved!
          soundService.playSuccessSound(0.35);
          setFeedback('correct');
          setTimeout(() => setFeedback(null), 400);

          solvedCount.current += 1;
          const bonus = (currentWord.length * 25) + (streak * 10);
          setScore((s) => s + bonus);
          setStreak((st) => st + 1);
          setRound((r) => r + 1);
          setTimeLeft((t) => Math.min(60, t + 4)); // Earn +4s per word
          nextWord();
        } else {
          soundService.playErrorSound(0.25);
          setFeedback('wrong');
          setTimeout(() => setFeedback(null), 400);
          setInputBuffer('');
          setStreak(0);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        soundService.playKeySound('soft', 0.2);
        setInputBuffer((prev) => prev + e.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, inputBuffer, isGameOver, isPlaying, streak]);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-bg-card border border-border rounded-xl mb-4 shadow-sm">
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-2">
            <Trophy className="text-warning w-5 h-5" />
            <span className="text-text-secondary text-xs uppercase">Score</span>
            <span className="text-accent font-bold text-lg">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs uppercase">Solved</span>
            <span className="text-info font-bold text-lg">{solvedCount.current}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-warning text-sm font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>{streak} Streak (+{streak * 10} pts)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs text-text-secondary uppercase">Clock</span>
          <span
            className={`text-xl font-bold px-3 py-1 rounded-lg border ${
              timeLeft <= 10
                ? 'bg-error/20 border-error text-error animate-pulse'
                : 'bg-bg-secondary border-border text-text-primary'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Anagram Solitaire Puzzle Board */}
      <div className="relative flex-1 bg-gradient-to-br from-[#12162a] via-[#0d1020] to-[#070912] border-2 border-indigo-950/60 rounded-2xl overflow-hidden shadow-2xl min-h-[460px] flex flex-col items-center justify-center p-6">
        {/* Soft Ambient Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
          }}
        />

        {/* Start Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-xl shadow-indigo-500/10">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Anagram Racer</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Unscramble words in rapid succession! Type the decoded word and press [ENTER]. Solving quickly adds bonus seconds to your timer.
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Start Unscrambling
              </button>
            </div>
          </div>
        )}

        {/* Time's Up Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-indigo-500/40 shadow-2xl">
              <Trophy className="w-14 h-14 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-text-primary mb-1">Time's Up!</h3>
              <p className="text-xs text-text-secondary mb-4">Great mental agility session</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Words Decoded</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{solvedCount.current}</span>
                <div className="text-xs text-text-secondary mt-1">Total Score: {score}</div>
              </div>

              <button
                onClick={startGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Play Again
              </button>
            </div>
          </div>
        )}

        {/* Active Scrambled Tile Display */}
        {isPlaying && (
          <div className="flex flex-col items-center z-10 w-full max-w-lg">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400/80 mb-3">
              Unscramble Letters &bull; Word #{round}
            </span>

            {/* Letter Tiles */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
              {scrambledWord.split('').map((letter, idx) => (
                <motion.div
                  key={`${letter}-${idx}`}
                  initial={{ scale: 0.8, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-indigo-950/80 border-2 border-indigo-500/50 flex items-center justify-center text-2xl sm:text-3xl font-extrabold font-mono text-indigo-200 shadow-lg shadow-indigo-950/50 uppercase"
                >
                  {letter}
                </motion.div>
              ))}
            </div>

            {/* Player's Typed Guess Box */}
            <div
              className={`w-full max-w-md p-4 rounded-2xl border-2 flex flex-col items-center transition-all ${
                feedback === 'correct'
                  ? 'bg-success/20 border-success shadow-lg shadow-success/20'
                  : feedback === 'wrong'
                  ? 'bg-error/20 border-error shadow-lg shadow-error/20 animate-shake'
                  : 'bg-bg-card/90 border-border'
              }`}
            >
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-accent min-h-[40px] flex items-center justify-center uppercase">
                {inputBuffer || (
                  <span className="text-text-muted text-base font-normal tracking-normal lowercase opacity-40">
                    type word and hit enter...
                  </span>
                )}
              </div>
            </div>

            {/* Word length indicator */}
            <div className="text-xs font-mono text-text-muted mt-4">
              Word length: {currentWord.length} letters &bull; Press [ENTER] to submit
            </div>
          </div>
        )}
      </div>

      {/* Hint Deck */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between text-xs text-text-secondary font-mono">
        <div>💡 Tip: Correct answers add +4 seconds to your remaining time!</div>
        <div className="hidden sm:block">[BACKSPACE] Edit &bull; [ESC] Clear Input</div>
      </div>
    </div>
  );
};
