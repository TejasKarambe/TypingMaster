import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gameRepository, activityRepository } from '@/services/storage/repositories';
import { GameId } from '@/types';
import { MatrixRainGame } from './games/MatrixRainGame';
import { TimeBombGame } from './games/TimeBombGame';
import { WordInvadersGame } from './games/WordInvadersGame';
import { AnagramRacerGame } from './games/AnagramRacerGame';
import { WordChainGame } from './games/WordChainGame';
import { SpeedSprintGame } from './games/SpeedSprintGame';
import { PrecisionTrialGame } from './games/PrecisionTrialGame';

export const GamePlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const handleGameOver = useCallback(
    async (score: number, level: number, wpm: number) => {
      const activeGameId = (gameId as GameId) || 'falling-words';
      const durationMs = 45000; // estimated session duration for record keeping

      try {
        await gameRepository.save({
          gameId: activeGameId,
          startedAt: Date.now() - durationMs,
          completedAt: Date.now(),
          score,
          level,
          wpm,
          accuracy: 1,
          durationMs,
          difficulty: 'medium',
          configSnapshot: {
            gameId: activeGameId,
            difficulty: 'medium',
          },
        });

        const today = new Date().toISOString().split('T')[0];
        const activity = await activityRepository.getOrCreate(today);
        activity.gamesPlayed += 1;
        activity.practiceDurationMs += durationMs;
        activity.xpEarned += score;
        await activityRepository.update(activity);
      } catch (err) {
        console.error('Failed to save game record:', err);
      }
    },
    [gameId]
  );

  const renderActiveGame = () => {
    switch (gameId) {
      case 'falling-words':
        return <MatrixRainGame onGameOver={handleGameOver} />;
      case 'typing-survival':
        return <TimeBombGame onGameOver={handleGameOver} />;
      case 'word-defender':
        return <WordInvadersGame onGameOver={handleGameOver} />;
      case 'type-racer':
        return <AnagramRacerGame onGameOver={handleGameOver} />;
      case 'sentence-sprint':
        return <WordChainGame onGameOver={handleGameOver} />;
      case 'accuracy-challenge':
        return <PrecisionTrialGame onGameOver={handleGameOver} />;
      default:
        return <MatrixRainGame onGameOver={handleGameOver} />;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          className="flex items-center text-text-secondary hover:text-accent transition-colors font-medium text-sm"
          onClick={() => navigate('/games')}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Arcade Games
        </button>
      </div>

      <div className="flex-1 flex flex-col">{renderActiveGame()}</div>
    </div>
  );
};

export default GamePlayPage;
