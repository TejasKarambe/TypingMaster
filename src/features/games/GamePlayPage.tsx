import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RefreshCw, Heart, Trophy } from 'lucide-react';
import { gameRepository, activityRepository } from '@/services/storage/repositories';
import { commonWords } from '@/data/wordlists';

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
}

export const GamePlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [inputBuffer, setInputBuffer] = useState('');
  
  const [words, setWords] = useState<FallingWord[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const wordIdCounter = useRef(0);
  const startTime = useRef(0);
  const typedCount = useRef(0);

  // Settings
  const baseSpeed = 0.5 + (level * 0.2);
  const spawnRate = Math.max(800, 2000 - (level * 200));

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(5);
    setLevel(1);
    setCombo(1);
    setInputBuffer('');
    setWords([]);
    wordIdCounter.current = 0;
    lastSpawnTime.current = performance.now();
    startTime.current = performance.now();
    typedCount.current = 0;
  };

  const saveGameResult = async () => {
    const durationMs = Math.round(performance.now() - startTime.current);
    const wpmVal = Math.round((typedCount.current / 5) / (durationMs / 60000)) || 0;

    const result = {
      gameId: (gameId as any) || 'falling-words',
      startedAt: Math.round(startTime.current),
      completedAt: Date.now(),
      score,
      level,
      wpm: isNaN(wpmVal) ? 0 : wpmVal,
      accuracy: 1,
      durationMs,
      difficulty: 'medium' as const,
      configSnapshot: {
        gameId: (gameId as any) || 'falling-words',
        difficulty: 'medium' as const
      }
    };
    
    await gameRepository.save(result);

    const today = new Date().toISOString().split('T')[0];
    const activity = await activityRepository.getOrCreate(today);
    activity.gamesPlayed += 1;
    activity.practiceDurationMs += durationMs;
    activity.xpEarned += score;
    await activityRepository.update(activity);
  };

  const spawnWord = useCallback((currentTime: number) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 100; // 100px buffer
    
    const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
    const randomX = Math.floor(Math.random() * containerWidth);
    
    const newWord: FallingWord = {
      id: wordIdCounter.current++,
      text: randomWord,
      x: Math.max(10, randomX),
      y: -30,
      speed: baseSpeed + (Math.random() * 0.5)
    };
    
    setWords(prev => [...prev, newWord]);
    lastSpawnTime.current = currentTime;
  }, [baseSpeed]);

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || isGameOver) return;

    if (time - lastSpawnTime.current > spawnRate) {
      spawnWord(time);
    }

    setWords(prevWords => {
      const nextWords = [];
      let livesLost = 0;
      
      for (const word of prevWords) {
        const nextY = word.y + word.speed;
        
        if (containerRef.current && nextY > containerRef.current.clientHeight) {
          livesLost++;
          setCombo(1); // Reset combo on miss
        } else {
          nextWords.push({ ...word, y: nextY });
        }
      }

      if (livesLost > 0) {
        setLives(prev => {
          const newLives = prev - livesLost;
          if (newLives <= 0) {
            setIsGameOver(true);
            setIsPlaying(false);
          }
          return Math.max(0, newLives);
        });
      }

      return nextWords;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, isGameOver, spawnRate, spawnWord]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, updateGame]);

  useEffect(() => {
    if (isGameOver && score > 0) {
      saveGameResult();
    }
  }, [isGameOver]);

  // Handle typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      
      if (e.key === 'Backspace') {
        setInputBuffer(prev => prev.slice(0, -1));
        return;
      }
      
      if (e.key === 'Escape') {
        setIsPlaying(false);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const newBuffer = inputBuffer + e.key;
        
        // Check for match
        const matchIndex = words.findIndex(w => w.text === newBuffer);
        
        if (matchIndex >= 0) {
          // Word matched!
          const word = words[matchIndex];
          setWords(prev => prev.filter((_, i) => i !== matchIndex));
          setInputBuffer('');
          setScore(prev => prev + (10 * word.text.length * combo));
          typedCount.current += word.text.length;
          setCombo(prev => prev + 1);
          
          if (score > 0 && score % 500 === 0) {
            setLevel(prev => prev + 1);
          }
        } else {
          // Check if any word starts with this buffer
          const partialMatch = words.some(w => w.text.startsWith(newBuffer));
          if (partialMatch) {
            setInputBuffer(newBuffer);
          } else {
            // Mistake
            setInputBuffer('');
            setCombo(1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, inputBuffer, words, combo, score]);

  return (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center text-text-secondary hover:text-accent transition-colors"
          onClick={() => navigate('/games')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Games
        </button>
        
        <div className="flex items-center space-x-6 text-lg font-bold">
          <div className="flex items-center font-mono"><Trophy className="text-warning mr-2" size={20} /> {score}</div>
          <div className="flex items-center font-mono"><span className="text-accent mr-2">LVL</span> {level}</div>
          <div className="flex items-center text-error gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart key={i} size={20} className={i < lives ? "fill-error text-error" : "opacity-30 text-border"} />
            ))}
          </div>
          {combo > 1 && <div className="text-warning animate-pulse font-mono text-sm">{combo}x Combo!</div>}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-bg-secondary rounded-xl border border-border relative overflow-hidden shadow-inner mb-4 min-h-[400px]"
      >
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 text-text-primary">Falling Words</h2>
              <p className="text-text-secondary mb-8 max-w-md">
                Type the falling words before they hit the bottom. Type correctly to build your combo multiplier!
              </p>
              <button className="btn-primary text-lg px-8 py-3.5 flex items-center justify-center gap-2 mx-auto" onClick={startGame}>
                <Play size={20} /> Start Game
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 z-10 backdrop-blur-sm">
            <div className="card p-8 text-center border-error/30 max-w-sm w-full">
              <h2 className="text-3xl font-bold text-error mb-2">Game Over!</h2>
              <p className="text-text-secondary mb-4 text-sm">You survived to Level {level}</p>
              
              <div className="text-5xl font-bold text-accent font-mono mb-6">{score}</div>
              
              <button className="btn-primary text-base px-6 py-2.5 w-full flex items-center justify-center gap-2" onClick={startGame}>
                <RefreshCw size={18} /> Play Again
              </button>
            </div>
          </div>
        )}

        {/* Falling Words */}
        {words.map(word => (
          <div
            key={word.id}
            className="absolute px-3 py-1 bg-bg-card border border-border rounded-lg shadow-md font-mono text-base font-bold whitespace-nowrap"
            style={{ 
              left: `${word.x}px`, 
              top: `${word.y}px`,
            }}
          >
            {/* Highlight typed portion */}
            {inputBuffer && word.text.startsWith(inputBuffer) ? (
              <>
                <span className="text-success">{inputBuffer}</span>
                <span className="text-text-primary">{word.text.slice(inputBuffer.length)}</span>
              </>
            ) : (
              <span className="text-text-primary">{word.text}</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-4 flex items-center justify-center">
        <div className="font-mono text-2xl font-bold tracking-widest h-8 text-accent min-w-[200px] text-center border-b-2 border-accent pb-1">
          {inputBuffer || <span className="opacity-30">Type here...</span>}
        </div>
      </div>
    </div>
  );
};

export default GamePlayPage;
