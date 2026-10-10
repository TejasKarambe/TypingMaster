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
  const requestRef = useRef<number>();
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
    const duration = (performance.now() - startTime.current) / 1000;
    const wpm = (typedCount.current / 5) / (duration / 60);

    const result = {
      gameId: gameId || 'falling-words',
      score,
      level,
      wpm: isNaN(wpm) ? 0 : Math.round(wpm),
      accuracy: 100, // simplified for now
      duration: Math.round(duration),
      date: new Date().toISOString()
    };
    
    await gameRepository.save(result);

    const today = new Date().toISOString().split('T')[0];
    const activity = await activityRepository.getById(today);
    if (activity) {
      activity.gamesPlayed += 1;
      activity.practiceTime += Math.round(duration);
      await activityRepository.save(activity);
    } else {
      await activityRepository.save({
        date: today,
        testsCompleted: 0,
        lessonsCompleted: 0,
        gamesPlayed: 1,
        practiceTime: Math.round(duration)
      });
    }
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
          className="flex items-center text-text-secondary hover:text-primary transition-colors"
          onClick={() => navigate('/games')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Games
        </button>
        
        <div className="flex items-center space-x-6 text-lg font-bold">
          <div className="flex items-center"><Trophy className="text-yellow-500 mr-2" /> {score}</div>
          <div className="flex items-center"><span className="text-primary mr-2">LVL</span> {level}</div>
          <div className="flex items-center text-red-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart key={i} size={20} className={i < lives ? "fill-red-500" : "opacity-30"} />
            ))}
          </div>
          {combo > 1 && <div className="text-orange-500 animate-pulse">{combo}x Combo!</div>}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-surface-muted rounded-xl border-2 border-border relative overflow-hidden shadow-inner mb-4"
      >
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6">Falling Words</h2>
              <p className="text-text-secondary mb-8 max-w-md">
                Type the falling words before they hit the bottom. Type correctly to build your combo multiplier!
              </p>
              <button className="btn btn-primary text-xl px-8 py-4" onClick={startGame}>
                <Play className="mr-2" /> Start Game
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10 backdrop-blur-sm">
            <div className="card p-8 text-center border-red-500/30">
              <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over!</h2>
              <p className="text-text-secondary mb-6">You survived to Level {level}</p>
              
              <div className="text-6xl font-bold text-primary mb-8">{score}</div>
              
              <button className="btn btn-primary text-lg px-8 w-full" onClick={startGame}>
                <RefreshCw className="mr-2" /> Play Again
              </button>
            </div>
          </div>
        )}

        {/* Falling Words */}
        {words.map(word => (
          <div
            key={word.id}
            className="absolute px-3 py-1 bg-surface border border-border rounded shadow-md font-mono text-lg font-bold whitespace-nowrap"
            style={{ 
              left: `${word.x}px`, 
              top: `${word.y}px`,
            }}
          >
            {/* Highlight typed portion */}
            {inputBuffer && word.text.startsWith(inputBuffer) ? (
              <>
                <span className="text-green-500">{inputBuffer}</span>
                <span>{word.text.slice(inputBuffer.length)}</span>
              </>
            ) : (
              word.text
            )}
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-center">
        <div className="font-mono text-2xl font-bold tracking-widest h-8 text-primary min-w-[200px] text-center border-b-2 border-primary pb-1">
          {inputBuffer || <span className="opacity-30">Type here...</span>}
        </div>
      </div>
    </div>
  );
};

export default GamePlayPage;
