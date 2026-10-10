import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Trophy, RefreshCw, Play, Sparkles, Check, ChevronRight } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface SpeedSprintProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const SpeedSprintGame: React.FC<SpeedSprintProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsDone, setWordsDone] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [combo, setCombo] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const charsTypedCount = useRef(0);

  const fillQueue = () => {
    const list: string[] = [];
    for (let i = 0; i < 30; i++) {
      list.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
    return list;
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setWordsDone(0);
    setTimeLeft(45);
    setCombo(0);
    setInputBuffer('');
    setWordQueue(fillQueue());
    startTime.current = performance.now();
    charsTypedCount.current = 0;
  };

  const activeWord = wordQueue[0] || '';

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
          soundService.playSuccessSound(0.4);
          const durationMin = (performance.now() - startTime.current) / 60000;
          const wpm = durationMin > 0 ? Math.round((charsTypedCount.current / 5) / durationMin) : 0;
          onGameOver(score, Math.floor(wordsDone / 10) + 1, wpm);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isPlaying, onGameOver, score, wordsDone]);

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

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (inputBuffer.toLowerCase() === activeWord.toLowerCase()) {
          // Correct word complete
          soundService.playSuccessSound(0.25);
          charsTypedCount.current += activeWord.length;
          const pts = (activeWord.length * 10) + (combo * 5);
          setScore((s) => s + pts);
          setWordsDone((w) => w + 1);
          setCombo((c) => c + 1);
          setInputBuffer('');
          setWordQueue((prev) => (prev.length <= 5 ? [...prev.slice(1), ...fillQueue()] : prev.slice(1)));
        } else {
          soundService.playErrorSound(0.2);
          setCombo(0);
          setInputBuffer('');
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const next = inputBuffer + e.key.toLowerCase();
        if (activeWord.toLowerCase().startsWith(next)) {
          soundService.playKeySound('click', 0.2);
          setInputBuffer(next);
        } else {
          soundService.playErrorSound(0.15);
          setCombo(0);
          setInputBuffer('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWord, combo, inputBuffer, isGameOver, isPlaying]);

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
            <span className="text-text-secondary text-xs uppercase">Completed</span>
            <span className="text-info font-bold text-lg">{wordsDone}</span>
          </div>
          {combo > 2 && (
            <div className="flex items-center gap-1 text-warning text-sm font-bold animate-pulse">
              <Flame className="w-4 h-4" />
              <span>{combo} Combo Streak</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <Clock className="w-5 h-5 text-accent" />
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

      {/* Speed Sprint Runway */}
      <div className="relative flex-1 bg-gradient-to-br from-[#161324] via-[#0f0c1c] to-[#090712] border-2 border-amber-950/50 rounded-2xl overflow-hidden shadow-2xl min-h-[460px] flex flex-col items-center justify-center p-6">
        {/* Runway stripes */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #d97706 0, #d97706 1px, transparent 0, transparent 40px)',
          }}
        />

        {/* Start Game Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl shadow-amber-500/10">
                <Flame className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Speed Sprint</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                45-second high-velocity single player sprint! Hit [SPACE] as soon as you finish each word to cycle immediately to the next.
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Start 45s Sprint
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-amber-500/40 shadow-2xl">
              <Trophy className="w-14 h-14 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-text-primary mb-1">Sprint Finished!</h3>
              <p className="text-xs text-text-secondary mb-4">45 seconds elapsed</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Words Sprinted</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{wordsDone}</span>
                <div className="text-xs text-text-secondary mt-1">Total Score: {score}</div>
              </div>

              <button
                onClick={startGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Run Another Sprint
              </button>
            </div>
          </div>
        )}

        {/* Runway active and upcoming words */}
        {isPlaying && (
          <div className="flex flex-col items-center z-10 w-full max-w-lg">
            {/* Active Big Word Spotlight */}
            <motion.div
              key={activeWord}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-text-primary mb-6 py-6 px-10 rounded-2xl bg-bg-card/90 border-2 border-accent/40 shadow-2xl shadow-accent/10 flex items-center gap-1"
            >
              <span className="text-accent underline font-extrabold">
                {activeWord.slice(0, inputBuffer.length)}
              </span>
              <span className="opacity-80">{activeWord.slice(inputBuffer.length)}</span>
            </motion.div>

            {/* Upcoming Next Words Queue */}
            <div className="flex items-center gap-3 overflow-hidden text-sm font-mono text-text-muted">
              <span>Next up:</span>
              {wordQueue.slice(1, 5).map((w, idx) => (
                <div
                  key={`${w}-${idx}`}
                  className="px-3 py-1 rounded-lg bg-bg-secondary border border-border opacity-70"
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Deck */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between text-xs text-text-secondary font-mono">
        <div>⚡ Press [SPACE] or [ENTER] to advance instantly after completing word</div>
        <div className="hidden sm:block">Maintain accuracy to stack combo multipliers!</div>
      </div>
    </div>
  );
};
