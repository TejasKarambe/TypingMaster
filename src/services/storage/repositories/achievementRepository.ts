import { db } from '../database';
import type { AchievementRecord } from '@/types';

export const achievementRepository = {
  async save(record: AchievementRecord): Promise<void> {
    try {
      const existing = await db.achievements
        .where('achievementId').equals(record.achievementId).first();
      if (existing) return; // Don't duplicate
      await db.achievements.add({
        achievementId: record.achievementId,
        unlockedAt: record.unlockedAt,
        metadata: record.metadata ? JSON.stringify(record.metadata) : undefined,
      });
    } catch (error) {
      console.error('Failed to save achievement:', error);
      throw new Error('Failed to save achievement');
    }
  },

  async getAll(): Promise<AchievementRecord[]> {
    try {
      const rows = await db.achievements.toArray();
      return rows.map(r => ({
        ...r,
        metadata: r.metadata ? JSON.parse(r.metadata) as Record<string, unknown> : undefined,
      }));
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  },

  async isUnlocked(achievementId: string): Promise<boolean> {
    try {
      const row = await db.achievements.where('achievementId').equals(achievementId).first();
      return !!row;
    } catch (error) {
      console.error('Failed to check achievement:', error);
      return false;
    }
  },

  async getCount(): Promise<number> {
    try {
      return await db.achievements.count();
    } catch (error) {
      console.error('Failed to count achievements:', error);
      return 0;
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.achievements.clear();
    } catch (error) {
      console.error('Failed to clear achievements:', error);
      throw new Error('Failed to clear achievements');
    }
  },
};
