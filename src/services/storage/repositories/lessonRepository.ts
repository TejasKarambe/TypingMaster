import { db } from '../database';
import type { LessonProgress } from '@/types';

export const lessonRepository = {
  async get(lessonId: string): Promise<LessonProgress | null> {
    try {
      const row = await db.lessonProgress.where('lessonId').equals(lessonId).first();
      if (!row) return null;
      return row as LessonProgress;
    } catch (error) {
      console.error('Failed to get lesson progress:', error);
      return null;
    }
  },

  async save(progress: LessonProgress): Promise<void> {
    try {
      const existing = await db.lessonProgress.where('lessonId').equals(progress.lessonId).first();
      if (existing) {
        await db.lessonProgress.update(existing.id!, progress);
      } else {
        await db.lessonProgress.add(progress);
      }
    } catch (error) {
      console.error('Failed to save lesson progress:', error);
      throw new Error('Failed to save lesson progress');
    }
  },

  async getAll(): Promise<LessonProgress[]> {
    try {
      return await db.lessonProgress.toArray() as LessonProgress[];
    } catch (error) {
      console.error('Failed to get all lesson progress:', error);
      return [];
    }
  },

  async getCompletedCount(): Promise<number> {
    try {
      return await db.lessonProgress.where('completed').equals(1).count();
    } catch (error) {
      console.error('Failed to count completed lessons:', error);
      return 0;
    }
  },

  async resetAll(): Promise<void> {
    try {
      await db.lessonProgress.clear();
    } catch (error) {
      console.error('Failed to reset lesson progress:', error);
      throw new Error('Failed to reset lesson progress');
    }
  },
};
