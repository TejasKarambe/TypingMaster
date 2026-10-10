import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair, Trophy, RefreshCw, Play, Heart, Zap } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface InvaderWord {
  id: number;
  text: string;
  x: number; // percentage from left
  y: number; // percentage from top
  speed: number;
  direction: number; // 1 = right, -1 = left
}

interface WordInvadersProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const WordInvadersGame: React.FC<WordInvadersProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [baseHealth, setBaseHealth] = useState(100);
  const [invaders, setInvaders] = useState<InvaderWord[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [laserEffect, setLaserEffect] = useState<{ x: number; y: number } | null>(null);

  const requestRef = useRef<number | undefined>(undefined);
  const startTime = useRef(0);
  const charsTypedCount = useRef(0);
  const invaderIdCounter = useRef(0);

  const startWave = (waveNum: number) => {
    const waveCount = 4 + waveNum * 2;
    const newInvaders: InvaderWord[] = [];

    for (let i = 0; i < waveCount; i++) {
      const word = commonWords[Math.floor(Math.random() * commonWords.length)];
      const row = Math.floor(i / 4);
      const col = i % 4;
      newInvaders.push({
        id: invaderIdCounter.current++,
        text: word,
        x: 15 + col * 20,
        y: 10 + row * 14,
        speed: 0.05 + waveNum * 0.02,
        direction: 1,
      });
    }

    setInvaders(newInvaders);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setWave(1);
    setBaseHealth(100);
    setInputBuffer('');
    invaderIdCounter.current = 0;
    startTime.current = performance.now();
    charsTypedCount.current = 0;
    startWave(1);
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const gameLoop = () => {
      setInvaders((prev) => {
        let reachedBottom = false;
        const updated = prev.map((inv) => {
          let nextX = inv.x + inv.direction * 0.12;
          let nextDirection = inv.direction;
          let nextY = inv.y;

          // Bounce off left/right walls and march down
          if (nextX > 80) {
            nextDirection = -1;
            nextY += 4;
          } else if (nextX < 10) {
            nextDirection = 1;
            nextY += 4;
          }

          if (nextY >= 82) {
            reachedBottom = true;
          }

          return { ...inv, x: nextX, y: nextY, direction: nextDirection };
        });

        if (reachedBottom) {
          soundService.playErrorSound(0.4);
          setBaseHealth((h) => {
            const nextH = h - 25;
            if (nextH <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
              const durationMin = (performance.now() - startTime.current) / 60000;
              const wpm = durationMin > 0 ? Math.round((charsTypedCount.current / 5) / durationMin) : 0;
              onGameOver(score, wave, wpm);
              return 0;
            }
            return nextH;
          });
          // Push invaders back up a bit
          return updated.filter((inv) => inv.y < 82);
        }

        // Wave cleared
        if (updated.length === 0) {
          soundService.playSuccessSound(0.4);
          setWave((w) => {
            const nextW = w + 1;
            startWave(nextW);
            return nextW;
          });
          setScore((s) => s + 200 * wave);
        }

        return updated;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, onGameOver, score, wave]);

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

        // Exact match
        const matchIdx = invaders.findIndex((inv) => inv.text.toLowerCase() === nextBuffer);
        if (matchIdx !== -1) {
          const hit = invaders[matchIdx];
          soundService.playSuccessSound(0.3);
          setLaserEffect({ x: hit.x, y: hit.y });
          setTimeout(() => setLaserEffect(null), 200);

          setInvaders((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputBuffer('');
          charsTypedCount.current += hit.text.length;
          setScore((s) => s + hit.text.length * 15);
          return;
        }

        // Prefix check
        const hasPrefix = invaders.some((inv) => inv.text.toLowerCase().startsWith(nextBuffer));
        if (hasPrefix) {
          soundService.playKeySound('click', 0.2);
          setInputBuffer(nextBuffer);
        } else {
          soundService.playErrorSound(0.15);
          setInputBuffer('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputBuffer, invaders, isGameOver, isPlaying]);

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
            <span className="text-text-secondary text-xs uppercase">Wave</span>
            <span className="text-info font-bold text-lg">{wave}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shield className={`w-5 h-5 ${baseHealth < 40 ? 'text-error animate-pulse' : 'text-success'}`} />
          <div className="w-28 h-2.5 bg-bg-tertiary rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-300 ${
                baseHealth < 40 ? 'bg-error' : 'bg-success'
              }`}
              style={{ width: `${baseHealth}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-text-secondary">{baseHealth}%</span>
        </div>
      </div>

      {/* Arcade Invaders Canvas Zone */}
      <div className="relative flex-1 bg-gradient-to-b from-[#0a0f1d] to-[#04060c] border-2 border-purple-950/60 rounded-2xl overflow-hidden shadow-2xl min-h-[460px]">
        {/* Starry Grid Dots */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Laser beam blast animation */}
        {laserEffect && (
          <div
            className="absolute bottom-8 w-1 bg-purple-400 shadow-[0_0_12px_#c084fc] z-10 transition-all pointer-events-none"
            style={{
              left: `${laserEffect.x}%`,
              top: `${laserEffect.y}%`,
            }}
          />
        )}

        {/* Start Game Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-xl shadow-purple-500/10">
                <Crosshair className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Word Invaders</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Alien word fleets are advancing on your orbital shields! Type words accurately to lock on lasers and vaporize each squadron.
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Launch Defense Cannon
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-error/40 shadow-2xl">
              <Shield className="w-14 h-14 text-error mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-error mb-1">Shields Collapsed</h3>
              <p className="text-xs text-text-secondary mb-4">The alien fleet reached the planetary surface</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Final Score</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{score}</span>
                <div className="text-xs text-text-secondary mt-1">Survived to Wave {wave}</div>
              </div>

              <button
                onClick={startGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Deploy New Defense
              </button>
            </div>
          </div>
        )}

        {/* Invaders on grid */}
        {invaders.map((inv) => {
          const isTargeted = inputBuffer && inv.text.toLowerCase().startsWith(inputBuffer.toLowerCase());

          return (
            <div
              key={inv.id}
              className={`absolute px-3 py-1.5 rounded-lg font-mono text-sm tracking-wider font-bold transition-all duration-75 shadow-lg border ${
                isTargeted
                  ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-400/50 scale-110 shadow-purple-500/30 z-10'
                  : 'bg-bg-card/90 border-purple-900/40 text-text-primary'
              }`}
              style={{
                left: `${inv.x}%`,
                top: `${inv.y}%`,
                transform: 'translate(-50%, 0)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-purple-400">&#9650;</span>
                {isTargeted ? (
                  <span>
                    <span className="text-purple-300 font-extrabold underline">{inv.text.slice(0, inputBuffer.length)}</span>
                    <span className="opacity-70">{inv.text.slice(inputBuffer.length)}</span>
                  </span>
                ) : (
                  <span>{inv.text}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Defensive turret bottom line */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
          <div className="w-16 h-4 bg-purple-500/20 border-t-2 border-purple-400 rounded-t-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Turret Targeting Bar */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-mono tracking-wider text-text-muted">Turret Lock:</span>
          <div className="font-mono text-xl font-bold tracking-widest text-purple-400 min-w-[140px] px-3 py-1 bg-bg-secondary rounded-lg border border-purple-900/40">
            {inputBuffer ? (
              <span>
                {inputBuffer}
                <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />
              </span>
            ) : (
              <span className="text-text-muted text-sm font-normal tracking-normal italic opacity-50">
                Target invading alien words...
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-text-muted font-mono hidden sm:block">
          Eliminate entire fleets before they touch the bottom border!
        </div>
      </div>
    </div>
  );
};
