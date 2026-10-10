import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Heart, Trophy, RefreshCw, Play, Flame, ShieldAlert } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface RainWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  length: number;
}

interface MatrixRainProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const MatrixRainGame: React.FC<MatrixRainProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [words, setWords] = useState<RainWord[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const wordIdCounter = useRef(0);
  const startTime = useRef(0);
  const typedCharsCount = useRef(0);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(5);
    setLevel(1);
    setCombo(0);
    setInputBuffer('');
    setWords([]);
    wordIdCounter.current = 0;
    lastSpawnTime.current = performance.now();
    startTime.current = performance.now();
    typedCharsCount.current = 0;
  };

  const spawnWord = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth - 120;
    const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
    const speed = 0.6 + level * 0.18 + Math.random() * 0.25;

    const newWord: RainWord = {
      id: wordIdCounter.current++,
      text: randomWord,
      x: Math.max(20, Math.floor(Math.random() * width)),
      y: -30,
      speed,
      length: randomWord.length,
    };

    setWords((prev) => [...prev, newWord]);
  }, [level]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const updateGame = (time: number) => {
      const spawnInterval = Math.max(900, 2200 - level * 200);
      if (time - lastSpawnTime.current > spawnInterval) {
        spawnWord();
        lastSpawnTime.current = time;
      }

      const containerHeight = containerRef.current?.clientHeight || 500;

      setWords((prevWords) => {
        const nextWords: RainWord[] = [];
        let missedCount = 0;

        for (const w of prevWords) {
          const nextY = w.y + w.speed;
          if (nextY > containerHeight - 35) {
            missedCount++;
          } else {
            nextWords.push({ ...w, y: nextY });
          }
        }

        if (missedCount > 0) {
          soundService.playErrorSound(0.4);
          setLives((l) => {
            const nextL = l - missedCount;
            if (nextL <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
              const durationMin = (performance.now() - startTime.current) / 60000;
              const wpm = durationMin > 0 ? Math.round((typedCharsCount.current / 5) / durationMin) : 0;
              onGameOver(score, level, wpm);
              return 0;
            }
            return nextL;
          });
          setCombo(0);
        }

        return nextWords;
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, level, onGameOver, score, spawnWord]);

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

        // Check if there's an exact match
        const matchIdx = words.findIndex((w) => w.text.toLowerCase() === nextBuffer);
        if (matchIdx !== -1) {
          const matched = words[matchIdx];
          soundService.playSuccessSound(0.3);
          setWords((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputBuffer('');
          const points = (matched.text.length * 10) + (combo * 5);
          setScore((s) => {
            const nextScore = s + points;
            if (nextScore > level * 350) {
              setLevel((lvl) => lvl + 1);
            }
            return nextScore;
          });
          setCombo((c) => c + 1);
          typedCharsCount.current += matched.text.length;
          return;
        }

        // Check if any word starts with this prefix
        const prefixExists = words.some((w) => w.text.toLowerCase().startsWith(nextBuffer));
        if (prefixExists) {
          soundService.playKeySound('click', 0.2);
          setInputBuffer(nextBuffer);
        } else {
          soundService.playErrorSound(0.2);
          setInputBuffer('');
          setCombo(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputBuffer, isGameOver, isPlaying, level, words, combo]);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-card border border-border rounded-xl mb-4">
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-2">
            <Trophy className="text-warning w-5 h-5" />
            <span className="text-text-secondary text-xs uppercase">Score</span>
            <span className="text-accent font-bold text-lg">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs uppercase">Level</span>
            <span className="text-info font-bold text-lg">{level}</span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 text-warning text-sm font-bold animate-pulse">
              <Flame className="w-4 h-4" />
              <span>{combo}x Streak</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-colors ${
                i < lives ? 'text-error fill-error' : 'text-border opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Cyberpunk Rain Matrix Box */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-gradient-to-b from-[#080d1a] to-[#040810] border-2 border-cyan-900/40 rounded-2xl overflow-hidden shadow-2xl min-h-[460px]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
        }}
      >
        {/* Neon scanline accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40"></div>

        {/* Danger zone floor line */}
        <div className="absolute inset-x-0 bottom-8 border-b border-dashed border-red-500/30 flex items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-red-400/40 px-2 bg-[#040810]/80">
            Defense Perimeter
          </span>
        </div>

        {/* Start Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-lg shadow-cyan-500/10">
                <ArrowDown className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2 tracking-tight">Word Stream</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Words are cascading down the neon data stream. Type whole words accurately before they breach the defense perimeter.
              </p>
              <button
                onClick={startGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Initialize Stream
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-error/40 shadow-2xl">
              <ShieldAlert className="w-14 h-14 text-error mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-error mb-1">Stream Overload</h3>
              <p className="text-xs text-text-secondary mb-4">Defense grid was breached</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Final Score</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{score}</span>
                <div className="text-xs text-text-secondary mt-1">Reached Level {level}</div>
              </div>

              <button
                onClick={startGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Reboot Stream
              </button>
            </div>
          </div>
        )}

        {/* Words falling */}
        {words.map((w) => {
          const isTargeted = inputBuffer && w.text.toLowerCase().startsWith(inputBuffer.toLowerCase());
          return (
            <div
              key={w.id}
              className={`absolute px-3 py-1.5 rounded-lg font-mono text-sm tracking-wide font-bold transition-transform duration-75 shadow-lg ${
                isTargeted
                  ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/40 shadow-cyan-500/20 scale-105 z-10'
                  : 'bg-bg-card/90 border border-border/80 text-text-primary'
              }`}
              style={{
                left: `${w.x}px`,
                top: `${w.y}px`,
              }}
            >
              {isTargeted ? (
                <span>
                  <span className="text-cyan-400 font-extrabold underline underline-offset-2">
                    {w.text.slice(0, inputBuffer.length)}
                  </span>
                  <span className="opacity-70">{w.text.slice(inputBuffer.length)}</span>
                </span>
              ) : (
                w.text
              )}
            </div>
          );
        })}
      </div>

      {/* Modern Neon Command Input Bar */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-mono tracking-wider text-text-muted">Target Buffer:</span>
          <div className="font-mono text-xl font-bold tracking-widest text-cyan-400 min-w-[140px] px-3 py-1 bg-bg-secondary rounded-lg border border-cyan-900/40">
            {inputBuffer ? (
              <span>
                {inputBuffer}
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
              </span>
            ) : (
              <span className="text-text-muted text-sm font-normal tracking-normal italic opacity-50">
                Type descending word...
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-text-muted font-mono hidden sm:block">
          [ESC] Clear Buffer &bull; [BACKSPACE] Correct Key
        </div>
      </div>
    </div>
  );
};
