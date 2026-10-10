import { db } from '../database';
import type { DailyActivity } from '@/types';

export const activityRepository = {
  async getOrCreate(dateKey: string): Promise<DailyActivity> {
    try {
      const existing = await db.dailyActivity.where('dateKey').equals(dateKey).first();
      if (existing) return existing as DailyActivity;
      const newActivity: DailyActivity = {
        dateKey,
        practiceDurationMs: 0,
        testsCompleted: 0,
        lessonsCompleted: 0,
        gamesPlayed: 0,
        xpEarned: 0,
        bestWpm: 0,
        averageWpm: 0,
        averageAccuracy: 0,
      };
      const id = await db.dailyActivity.add(newActivity as import('../database').DBDailyActivity);
      return { ...newActivity, id: id as number };
    } catch (error) {
      console.error('Failed to get/create activity:', error);
      return {
        dateKey,
        practiceDurationMs: 0,
        testsCompleted: 0,
        lessonsCompleted: 0,
        gamesPlayed: 0,
        xpEarned: 0,
        bestWpm: 0,
        averageWpm: 0,
        averageAccuracy: 0,
      };
    }
  },

  async update(activity: DailyActivity): Promise<void> {
    try {
      if (activity.id) {
        await db.dailyActivity.update(activity.id, activity as import('../database').DBDailyActivity);
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  },

  async getRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
    try {
      return await db.dailyActivity
        .where('dateKey')
        .between(startDate, endDate, true, true)
        .toArray() as DailyActivity[];
    } catch (error) {
      console.error('Failed to get activity range:', error);
      return [];
    }
  },

  async getAll(): Promise<DailyActivity[]> {
    try {
      return await db.dailyActivity.orderBy('dateKey').toArray() as DailyActivity[];
    } catch (error) {
      console.error('Failed to get all activities:', error);
      return [];
    }
  },

  async getCurrentStreak(): Promise<number> {
    try {
      const activities = await db.dailyActivity.orderBy('dateKey').reverse().toArray();
      if (activities.length === 0) return 0;
      let streak = 0;
      const today = new Date();
      const dateStr = (d: Date) => d.toISOString().split('T')[0];
      let checkDate = new Date(today);
      // Check if today has activity
      const todayActivity = activities.find(a => a.dateKey === dateStr(checkDate));
      if (!todayActivity || todayActivity.practiceDurationMs === 0) {
        // Check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      }
      for (let i = 0; i < 365; i++) {
        const key = dateStr(checkDate);
        const activity = activities.find(a => a.dateKey === key);
        if (activity && activity.practiceDurationMs > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    } catch (error) {
      console.error('Failed to calculate streak:', error);
      return 0;
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.dailyActivity.clear();
    } catch (error) {
      console.error('Failed to clear activities:', error);
      throw new Error('Failed to clear activities');
    }
  },
};
