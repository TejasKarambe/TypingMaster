import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Trophy, RefreshCw, Play, Sparkles, Check, X } from 'lucide-react';
import { commonWords } from '@/data/wordlists';
import { soundService } from '@/services/audio/soundService';

interface WordChainProps {
  onGameOver: (score: number, level: number, wpm: number) => void;
}

export const WordChainGame: React.FC<WordChainProps> = ({ onGameOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [chainLength, setChainLength] = useState(0);
  const [chainWords, setChainWords] = useState<string[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const typedCount = useRef(0);

  const startNewGame = () => {
    const starter = commonWords.filter((w) => w.length >= 4 && w.length <= 6)[Math.floor(Math.random() * 20)];
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setChainLength(1);
    setChainWords([starter]);
    setInputBuffer('');
    setTimeLeft(12);
    setErrorMsg(null);
    startTime.current = performance.now();
    typedCount.current = starter.length;
  };

  const lastWord = chainWords[chainWords.length - 1] || '';
  const requiredFirstChar = lastWord.slice(-1).toLowerCase();

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
          soundService.playErrorSound(0.4);
          const durationMin = (performance.now() - startTime.current) / 60000;
          const wpm = durationMin > 0 ? Math.round((typedCount.current / 5) / durationMin) : 0;
          onGameOver(score, chainLength, wpm);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [chainLength, isGameOver, isPlaying, onGameOver, score]);

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
        const candidate = inputBuffer.trim().toLowerCase();
        if (candidate.length < 3) {
          setErrorMsg('Must be at least 3 letters long!');
          soundService.playErrorSound(0.2);
          setTimeout(() => setErrorMsg(null), 1200);
          return;
        }

        if (candidate.charAt(0) !== requiredFirstChar) {
          setErrorMsg(`Word must start with letter "${requiredFirstChar.toUpperCase()}"!`);
          soundService.playErrorSound(0.2);
          setTimeout(() => setErrorMsg(null), 1200);
          return;
        }

        if (chainWords.includes(candidate)) {
          setErrorMsg(`"${candidate}" was already used in this chain!`);
          soundService.playErrorSound(0.2);
          setTimeout(() => setErrorMsg(null), 1200);
          return;
        }

        // Valid link!
        soundService.playSuccessSound(0.35);
        typedCount.current += candidate.length;
        const pts = candidate.length * 20 + chainLength * 15;
        setScore((s) => s + pts);
        setChainLength((l) => l + 1);
        setChainWords((prev) => [...prev.slice(-4), candidate]);
        setInputBuffer('');
        setTimeLeft(10); // Refresh timer to 10s
        setErrorMsg(null);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        soundService.playKeySound('mechanical', 0.2);
        setInputBuffer((prev) => prev + e.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chainLength, chainWords, inputBuffer, isGameOver, isPlaying, requiredFirstChar]);

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
            <span className="text-text-secondary text-xs uppercase">Links</span>
            <span className="text-info font-bold text-lg">{chainLength}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs text-text-secondary uppercase">Link Timer</span>
          <span
            className={`text-xl font-bold px-3 py-1 rounded-lg border ${
              timeLeft <= 4
                ? 'bg-error/20 border-error text-error animate-pulse'
                : 'bg-bg-secondary border-border text-text-primary'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Word Chain Arena */}
      <div className="relative flex-1 bg-gradient-to-br from-[#0c1917] via-[#081210] to-[#040807] border-2 border-emerald-950/60 rounded-2xl overflow-hidden shadow-2xl min-h-[460px] flex flex-col items-center justify-between p-6">
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
          }}
        />

        {/* Start Game Modal */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm z-20">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary mb-2">Word Chain</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Build the longest unbroken chain of words! Each new word must begin with the final letter of the previous word. Press [ENTER] to connect.
              </p>
              <button
                onClick={startNewGame}
                className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 mx-auto font-bold shadow-lg shadow-accent/20"
              >
                <Play className="w-5 h-5" /> Start Word Chain
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md z-20">
            <div className="card text-center p-8 max-w-sm w-full border-emerald-500/40 shadow-2xl">
              <Trophy className="w-14 h-14 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-text-primary mb-1">Chain Snapped!</h3>
              <p className="text-xs text-text-secondary mb-4">Time expired before connection</p>

              <div className="bg-bg-tertiary p-4 rounded-xl mb-6">
                <span className="text-xs text-text-muted uppercase block mb-1">Chain Length</span>
                <span className="text-4xl font-extrabold font-mono text-accent">{chainLength}</span>
                <div className="text-xs text-text-secondary mt-1">Final Score: {score}</div>
              </div>

              <button
                onClick={startNewGame}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Forge New Chain
              </button>
            </div>
          </div>
        )}

        {/* Active Chain Links Render */}
        <div className="flex flex-col items-center gap-2 w-full max-w-lg mt-4 z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400/80 mb-2">
            Connected Links
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {chainWords.map((word, idx) => (
              <React.Fragment key={`${word}-${idx}`}>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 font-mono text-sm sm:text-base font-bold text-emerald-300 shadow-md">
                  {word.slice(0, -1)}
                  <span className="text-accent underline font-extrabold">{word.slice(-1)}</span>
                </div>
                {idx < chainWords.length - 1 && (
                  <span className="text-emerald-500/60 font-bold">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Target Indicator Center */}
        {isPlaying && (
          <div className="flex flex-col items-center my-6 z-10">
            <div className="text-xs font-mono text-text-muted uppercase mb-2">
              Next word must begin with:
            </div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl font-extrabold font-mono text-accent shadow-xl shadow-emerald-500/20 uppercase animate-bounce">
              {requiredFirstChar}
            </div>
            {errorMsg && (
              <div className="text-error text-xs font-mono font-bold mt-3 animate-shake">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* User typed input field */}
        <div className="w-full max-w-md p-4 rounded-2xl border-2 bg-bg-card/90 border-border z-10">
          <div className="font-mono text-2xl font-bold tracking-widest text-emerald-300 min-h-[36px] flex items-center justify-center uppercase">
            {inputBuffer ? (
              <span>
                {inputBuffer}
                <span className="inline-block w-2 h-5 bg-emerald-400 ml-1 animate-pulse" />
              </span>
            ) : (
              <span className="text-text-muted text-sm font-normal tracking-normal lowercase opacity-40">
                type word starting with "{requiredFirstChar}" + [ENTER]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 bg-bg-card border border-border p-4 rounded-xl flex items-center justify-between text-xs text-text-secondary font-mono">
        <div>🔗 Tip: Long words grant exponentially larger link points!</div>
        <div className="hidden sm:block">[ENTER] Submit &bull; [BACKSPACE] Edit</div>
      </div>
    </div>
  );
};
