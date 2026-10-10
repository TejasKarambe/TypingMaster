import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Flame, Trophy, RefreshCw, Play, Clock, Sparkles } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface BombWord {
  id: number;
  text: string;
  totalTime: number; // in seconds
  remainingTime: number; // in seconds
  x: number;
  y: number;
}

interface TimeBombProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const TimeBombGame: React.FC<TimeBombProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [defusedCount, setDefusedCount] = useState(0);
  const [activeBombs, setActiveBombs] = useState<BombWord[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [multiplier, setMultiplier] = useState(1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bombIdCounter = useRef(0);
  const startTime = useRef(0);
  const charsTypedCount = useRef(0);

  const spawnBomb = () => {
    const word = commonWords[Math.floor(Math.random() * commonWords.length)];
    // Base countdown 4.5s to 7s based on length
    const timeLimit = Math.max(3.5, 3 + word.length * 0.7);
    
    // Pick grid position slot (6 distinct zones)
    const slotX = 15 + Math.random() * 70;
    const slotY = 15 + Math.random() * 65;

    const newBomb: BombWord = {
      id: bombIdCounter.current++,
      text: word,
      totalTime: timeLimit,
      remainingTime: timeLimit,
      x: slotX,
      y: slotY,
    };

    setActiveBombs((prev) => (prev.length < 5 ? [...prev, newBomb] : prev));
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setDefusedCount(0);
    setInputBuffer('');
    setMultiplier(1);
    setActiveBombs([]);
    bombIdCounter.current = 0;
    startTime.current = performance.now();
    charsTypedCount.current = 0;

    // Initial 2 bombs
    setTimeout(spawnBomb, 200);
    setTimeout(spawnBomb, 1200);
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // Periodic spawn if under capacity
      if (Math.random() < 0.35 && activeBombs.length < 5) {
        spawnBomb();
      }

      setActiveBombs((prevBombs) => {
        let exploded = false;
        const updated = prevBombs.map((bomb) => {
          const nextTime = bomb.remainingTime - 0.1;
          if (nextTime <= 0) {
            exploded = true;
          }
          return { ...bomb, remainingTime: nextTime };
        });

        if (exploded) {
          soundService.playErrorSound(0.5);
          setIsGameOver(true);
          setIsPlaying(false);
          const durationMin = (performance.now() - startTime.current) / 60000;
          const wpm = durationMin > 0 ? Math.round((charsTypedCount.current / 5) / durationMin) : 0;
          onGameOver(score, Math.floor(defusedCount / 5) + 1, wpm);
        }

        return updated;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver, activeBombs.length, onGameOver, score, defusedCount]);

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

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const nextBuffer = inputBuffer + e.key.toLowerCase();

        // Exact match check
        const matchIdx = activeBombs.findIndex((b) => b.text.toLowerCase() === nextBuffer);
        if (matchIdx !== -1) {
          const defused = activeBombs[matchIdx];
          soundService.playSuccessSound(0.35);
          setActiveBombs((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputBuffer('');
          charsTypedCount.current += defused.text.length;

          const points = Math.round(defused.text.length * 20 * multiplier);
          setScore((s) => s + points);
          setDefusedCount((c) => c + 1);
          setMultiplier((m) => Math.min(4, +(m + 0.2).toFixed(1)));
          return;
        }

        // Prefix match check
        const hasPrefix = activeBombs.some((b) => b.text.toLowerCase().startsWith(nextBuffer));
        if (hasPrefix) {
          soundService.playKeySound('typewriter', 0.25);
          setInputBuffer(nextBuffer);
        } else {
          soundService.playErrorSound(0.2);
          setInputBuffer('');
          setMultiplier(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBombs, inputBuffer, isGameOver, isPlaying, multiplier]);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header HUD */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-bg-card border border-border rounded-xl mb-4 shadow-sm">
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-2">
            <Trophy className="text-warning w-5 h-5" />
            <span className="text-text-secondary text-xs uppercase">Defused</span>
            <span className="text-accent font-bold text-lg">{defusedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs uppercase">Score</span>
            <span className="text-text-primary font-bold text-lg">{score}</span>
          </div>
          {multiplier > 1 && (
            <div className="flex items-center gap-1 text-warning text-sm font-bold animate-pulse">
              <Flame className="w-4 h-4" />
              <span>{multiplier}x Bonus</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-error font-bold bg-error/10 px-3 py-1.5 rounded-lg border border-error/20">
          <Bomb className="w-4 h-4 animate-bounce" />
          <span>Active Threats: {activeBombs.length}</span>
        </div>
      </div>

      {/* Explosive Bomb Chamber Arena */}
      <div className="relative flex-1 bg-gradient-to-br from-[#1c0f13] via-[#120a0d] to-[#0a0507] border-2 border-red-950/60 rounded-2xl overflow-hidden shadow-2xl min-h-[460px]">
        {/* Pulsing Alert Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.06)_0%,_transparent_70%)] pointer-events-none" />

        {/* Start Game Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-error/15 border border-error/30 flex items-center justify-center mx-auto mb-4 text-error shadow-xl shadow-error/10">
                <Bomb className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Time Bomb Defusal</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Ticking time bombs will detonate unless you type their secret codes before zero! Stay calm and type rapidly under pressure.
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Start Defusal Drill
              </button>
            </div>
          </div>
        )}

        {/* Detonation Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-error/40 shadow-2xl">
              <div className="text-5xl mb-2">💥</div>
              <h3 className="text-2xl font-bold text-error mb-1">DETONATED!</h3>
              <p className="text-xs text-text-secondary mb-4">A fuse reached zero</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Bombs Defused</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{defusedCount}</span>
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

        {/* Floating Ticking Bombs */}
        {activeBombs.map((bomb) => {
          const percent = Math.max(0, (bomb.remainingTime / bomb.totalTime) * 100);
          const isCritical = bomb.remainingTime < 2;
          const isTargeted = inputBuffer && bomb.text.toLowerCase().startsWith(inputBuffer.toLowerCase());

          return (
            <motion.div
              key={bomb.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-100 ${
                isCritical
                  ? 'bg-red-950/90 border-error animate-pulse shadow-xl shadow-error/30'
                  : isTargeted
                  ? 'bg-amber-950/90 border-warning ring-2 ring-warning/50 shadow-lg scale-110'
                  : 'bg-bg-card/90 border-border shadow-md'
              }`}
              style={{
                left: `${bomb.x}%`,
                top: `${bomb.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Bomb Header / Fuse */}
              <div className="flex items-center gap-2 mb-1.5">
                <Bomb className={`w-4 h-4 ${isCritical ? 'text-error animate-spin' : 'text-text-muted'}`} />
                <span
                  className={`font-mono text-xs font-bold ${
                    isCritical ? 'text-error font-extrabold text-sm' : 'text-text-secondary'
                  }`}
                >
                  {bomb.remainingTime.toFixed(1)}s
                </span>
              </div>

              {/* Progress fuse bar */}
              <div className="w-24 h-1.5 bg-bg-secondary rounded-full overflow-hidden mb-2 border border-border/50">
                <div
                  className={`h-full transition-all duration-100 ${
                    isCritical ? 'bg-error' : 'bg-warning'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Word Text */}
              <div className="font-mono text-base font-bold tracking-wider px-2 py-0.5 rounded bg-bg-secondary/70 border border-border/40">
                {isTargeted ? (
                  <span>
                    <span className="text-warning font-extrabold underline">{bomb.text.slice(0, inputBuffer.length)}</span>
                    <span className="text-text-primary">{bomb.text.slice(inputBuffer.length)}</span>
                  </span>
                ) : (
                  <span className="text-text-primary">{bomb.text}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input Deck */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-mono tracking-wider text-text-muted">Defusal Code:</span>
          <div className="font-mono text-xl font-bold tracking-widest text-warning min-w-[140px] px-3 py-1 bg-bg-secondary rounded-lg border border-warning/30">
            {inputBuffer ? (
              <span>
                {inputBuffer}
                <span className="inline-block w-2 h-4 bg-warning ml-1 animate-pulse" />
              </span>
            ) : (
              <span className="text-text-muted text-sm font-normal tracking-normal italic opacity-50">
                Type threatening word to defuse...
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-text-muted font-mono hidden sm:block">
          [ESC] Reset Input &bull; Faster typing earns multiplier bonuses!
        </div>
      </div>
    </div>
  );
};
