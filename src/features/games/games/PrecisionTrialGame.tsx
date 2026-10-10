import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Award, Trophy, RefreshCw, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { advancedWords, commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface PrecisionTrialProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const PrecisionTrialGame: React.FC<PrecisionTrialProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageTimer, setStageTimer] = useState(12);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const totalCharsCount = useRef(0);

  const getWordForStage = (s: number) => {
    if (s <= 3) {
      return commonWords.filter((w) => w.length >= 4 && w.length <= 6)[Math.floor(Math.random() * 30)];
    } else if (s <= 7) {
      return commonWords.filter((w) => w.length >= 7)[Math.floor(Math.random() * 20)];
    } else {
      return advancedWords[Math.floor(Math.random() * advancedWords.length)];
    }
  };

  const nextStage = (nextS: number) => {
    const word = getWordForStage(nextS);
    setCurrentWord(word);
    setCurrentIndex(0);
    setStage(nextS);
    setStageTimer(Math.max(6, 14 - Math.floor(nextS / 2)));
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setStage(1);
    setCurrentIndex(0);
    totalCharsCount.current = 0;
    startTime.current = performance.now();
    nextStage(1);
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStageTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
          setIsPlaying(false);
          soundService.playErrorSound(0.5);
          const durationMin = (performance.now() - startTime.current) / 60000;
          const wpm = durationMin > 0 ? Math.round((totalCharsCount.current / 5) / durationMin) : 0;
          onGameOver(score, stage, wpm);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, isPlaying, onGameOver, score, stage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const expected = currentWord[currentIndex];
        if (e.key.toLowerCase() === expected.toLowerCase()) {
          // Correct keystroke
          soundService.playKeySound('mechanical', 0.25);
          const nextIdx = currentIndex + 1;
          totalCharsCount.current += 1;

          if (nextIdx >= currentWord.length) {
            // Stage Cleared!
            soundService.playSuccessSound(0.4);
            const stagePoints = currentWord.length * 30 + stage * 50;
            setScore((s) => s + stagePoints);
            nextStage(stage + 1);
          } else {
            setCurrentIndex(nextIdx);
          }
        } else {
          // ONE MISTAKE = INSTANT ELIMINATION!
          soundService.playErrorSound(0.5);
          setIsGameOver(true);
          setIsPlaying(false);
          const durationMin = (performance.now() - startTime.current) / 60000;
          const wpm = durationMin > 0 ? Math.round((totalCharsCount.current / 5) / durationMin) : 0;
          onGameOver(score, stage, wpm);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentWord, isGameOver, isPlaying, onGameOver, score, stage]);

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
            <Award className="text-success w-5 h-5" />
            <span className="text-text-secondary text-xs uppercase">Stage</span>
            <span className="text-success font-bold text-lg">{stage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs text-text-secondary uppercase">Window:</span>
          <span
            className={`text-xl font-bold px-3 py-1 rounded-lg border ${
              stageTimer <= 3
                ? 'bg-error/20 border-error text-error animate-pulse'
                : 'bg-bg-secondary border-border text-text-primary'
            }`}
          >
            {stageTimer}s
          </span>
        </div>
      </div>

      {/* Precision Chamber */}
      <div className="relative flex-1 bg-gradient-to-br from-[#121915] via-[#0b120e] to-[#050907] border-2 border-emerald-900/60 rounded-2xl overflow-hidden shadow-2xl min-h-[460px] flex flex-col items-center justify-center p-6">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.12) 0%, transparent 60%)',
          }}
        />

        {/* Start Game Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-4 text-success shadow-xl shadow-success/10">
                <Crosshair className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Precision Trial</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                The ultimate test of flawless accuracy. <strong>Zero mistakes allowed</strong>. A single erroneous keystroke or expired timer immediately ends your run!
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Begin Flawless Trial
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-error/40 shadow-2xl">
              <ShieldAlert className="w-14 h-14 text-error mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-error mb-1">Trial Failed!</h3>
              <p className="text-xs text-text-secondary mb-4">A single mistake ended your streak</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Stages Mastered</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{stage - 1}</span>
                <div className="text-xs text-text-secondary mt-1">Final Score: {score}</div>
              </div>

              <button
                onClick={startGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* Big Precision Word Display */}
        {isPlaying && (
          <div className="flex flex-col items-center z-10 w-full max-w-lg">
            <span className="text-xs font-mono uppercase tracking-widest text-success/80 mb-6">
              Stage #{stage} &bull; 100% Accuracy Required
            </span>

            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest py-8 px-12 rounded-3xl bg-bg-card/90 border-2 border-success/40 shadow-2xl flex items-center gap-1">
              {currentWord.split('').map((char, idx) => {
                const isTyped = idx < currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <span
                    key={idx}
                    className={`transition-colors ${
                      isTyped
                        ? 'text-success'
                        : isCurrent
                        ? 'text-accent underline underline-offset-8 animate-pulse'
                        : 'text-text-muted'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rules Footer */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between text-xs text-text-secondary font-mono">
        <div>🎯 Rules: Precision is absolute. Type calmly, one accurate key at a time.</div>
        <div className="hidden sm:block">No backspacing &bull; Mistakes fatal</div>
      </div>
    </div>
  );
};
