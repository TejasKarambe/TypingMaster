import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Play } from 'lucide-react';
import { gameMetadata } from '@/data/games/gameData';
import { gameRepository } from '@/services/storage/repositories';
import { GameRecord } from '@/types';

export const GamesPage: React.FC = () => {
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const results = await gameRepository.getAll();
        const scores: Record<string, number> = {};
        
        results.forEach((result: GameRecord) => {
          if (!scores[result.gameId] || result.score > scores[result.gameId]) {
            scores[result.gameId] = result.score;
          }
        });
        
        setHighScores(scores);
      } catch (error) {
        console.error('Failed to load game scores:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Gamepad2 className="mr-3 text-accent" size={32} />
          Typing Games
        </h1>
        <p className="text-text-secondary">
          Improve your typing skills with fun, interactive games.
        </p>
      </div>

      {gameMetadata.length === 0 ? (
        <div className="text-center p-12 card border-dashed">
          <p className="text-text-muted">No games available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameMetadata.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden hover:border-accent/50 transition-colors flex flex-col h-full p-0"
            >
              <div className="h-36 bg-bg-tertiary flex items-center justify-center relative overflow-hidden group">
                <Gamepad2 size={54} className="text-accent opacity-60 group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold mb-2 text-text-primary">{game.title}</h2>
                <p className="text-text-secondary text-sm mb-6 flex-1">
                  {game.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-warning font-bold font-mono">
                    <Trophy size={18} className="mr-2" />
                    {highScores[game.id] ? highScores[game.id].toLocaleString() : '0'}
                  </div>
                  
                  <Link to={`/games/${game.id}`} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                    <Play size={15} />
                    Play
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
