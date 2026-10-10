import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Play } from 'lucide-react';
import { gameMetadata } from '@/data/games/gameData';
import { gameRepository } from '@/services/storage/repositories';
import { GameResult } from '@/types/game';

export const GamesPage: React.FC = () => {
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const results = await gameRepository.getAll();
        const scores: Record<string, number> = {};
        
        results.forEach((result: GameResult) => {
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
          <Gamepad2 className="mr-3 text-primary" size={32} />
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
              className="card overflow-hidden hover:border-primary transition-colors flex flex-col h-full"
            >
              <div className="h-40 bg-surface-muted flex items-center justify-center relative overflow-hidden group">
                {/* Fallback pattern if no thumbnail */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
                <Gamepad2 size={64} className="text-primary opacity-50 group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                <p className="text-text-secondary text-sm mb-6 flex-1">
                  {game.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-yellow-500 font-bold">
                    <Trophy size={18} className="mr-2" />
                    {highScores[game.id] ? highScores[game.id].toLocaleString() : '0'}
                  </div>
                  
                  <Link to={`/games/${game.id}`} className="btn btn-primary">
                    <Play size={16} className="mr-2" />
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
