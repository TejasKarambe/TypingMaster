import { db } from '../database';
import type { GameRecord, GameConfig } from '@/types';

export const gameRepository = {
  async save(record: GameRecord): Promise<void> {
    try {
      await db.gameRecords.add({
        ...record,
        configSnapshot: JSON.stringify(record.configSnapshot),
      } as unknown as import('../database').DBGameRecord);
    } catch (error) {
      console.error('Failed to save game record:', error);
      throw new Error('Failed to save game record');
    }
  },

  async getByGameId(gameId: string, limit?: number): Promise<GameRecord[]> {
    try {
      let collection = db.gameRecords.where('gameId').equals(gameId).reverse();
      const rows = limit ? await collection.limit(limit).sortBy('startedAt') : await collection.sortBy('startedAt');
      return rows.reverse().map(r => ({
        ...r,
        configSnapshot: JSON.parse(r.configSnapshot) as GameConfig,
      })) as GameRecord[];
    } catch (error) {
      console.error('Failed to get game records:', error);
      return [];
    }
  },

  async getAll(): Promise<GameRecord[]> {
    try {
      const rows = await db.gameRecords.orderBy('startedAt').reverse().toArray();
      return rows.map(r => ({
        ...r,
        configSnapshot: JSON.parse(r.configSnapshot) as GameConfig,
      })) as GameRecord[];
    } catch (error) {
      console.error('Failed to get all game records:', error);
      return [];
    }
  },

  async getHighScore(gameId: string): Promise<number> {
    try {
      const records = await db.gameRecords.where('gameId').equals(gameId).toArray();
      if (records.length === 0) return 0;
      return Math.max(...records.map(r => r.score));
    } catch (error) {
      console.error('Failed to get high score:', error);
      return 0;
    }
  },

  async getCount(): Promise<number> {
    try {
      return await db.gameRecords.count();
    } catch (error) {
      console.error('Failed to count game records:', error);
      return 0;
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.gameRecords.clear();
    } catch (error) {
      console.error('Failed to clear game records:', error);
      throw new Error('Failed to clear game records');
    }
  },
};
