import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  Play,
  ArrowDown,
  Bomb,
  Crosshair,
  HelpCircle,
  Target,
  Award,
} from 'lucide-react';
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

  const getGameIcon = (id: string) => {
    switch (id) {
      case 'falling-words':
        return <ArrowDown size={38} className="text-cyan-400 group-hover:translate-y-1 transition-transform" />;
      case 'typing-survival':
        return <Bomb size={38} className="text-red-400 group-hover:scale-110 transition-transform" />;
      case 'word-defender':
        return <Crosshair size={38} className="text-purple-400 group-hover:rotate-45 transition-transform" />;
      case 'type-racer':
        return <HelpCircle size={38} className="text-indigo-400 group-hover:scale-110 transition-transform" />;
      case 'sentence-sprint':
        return <Target size={38} className="text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'accuracy-challenge':
        return <Award size={38} className="text-green-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Gamepad2 size={38} className="text-accent" />;
    }
  };

  const getGameBgGradient = (id: string) => {
    switch (id) {
      case 'falling-words':
        return 'from-cyan-950/60 to-cyan-900/10 border-cyan-500/20';
      case 'typing-survival':
        return 'from-red-950/60 to-red-900/10 border-red-500/20';
      case 'word-defender':
        return 'from-purple-950/60 to-purple-900/10 border-purple-500/20';
      case 'type-racer':
        return 'from-indigo-950/60 to-indigo-900/10 border-indigo-500/20';
      case 'sentence-sprint':
        return 'from-emerald-950/60 to-emerald-900/10 border-emerald-500/20';
      case 'accuracy-challenge':
        return 'from-green-950/60 to-green-900/10 border-green-500/20';
      default:
        return 'from-bg-tertiary to-bg-secondary border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Gamepad2 className="mr-3 text-accent" size={32} />
          Word Arcade
        </h1>
        <p className="text-text-secondary text-sm">
          Original single-player typing games with unique visual themes, mechanics, and countdown challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameMetadata.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="card overflow-hidden hover:border-accent/50 transition-all flex flex-col h-full p-0 shadow-lg group hover:scale-[1.01]"
          >
            {/* Unique Game Themed Header Banner */}
            <div
              className={`h-36 bg-gradient-to-br ${getGameBgGradient(
                game.id
              )} flex items-center justify-center relative overflow-hidden border-b border-border/50`}
            >
              <div className="p-4 rounded-2xl bg-bg-card/60 backdrop-blur-md border border-white/5 shadow-xl">
                {getGameIcon(game.id)}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-bold mb-2 text-text-primary tracking-tight">
                {game.title}
              </h2>
              <p className="text-text-secondary text-xs leading-relaxed mb-6 flex-1">
                {game.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
                <div className="flex items-center text-warning font-bold font-mono text-sm">
                  <Trophy size={16} className="mr-1.5" />
                  {highScores[game.id] ? highScores[game.id].toLocaleString() : '0'}
                </div>

                <Link
                  to={`/games/${game.id}`}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
                >
                  <Play size={14} />
                  Play Solo
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
