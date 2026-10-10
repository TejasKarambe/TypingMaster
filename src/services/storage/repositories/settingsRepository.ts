import { db } from '../database';
import type { AppSettings } from '@/types';

const SETTINGS_ID = 1;

export const settingsRepository = {
  async get(): Promise<AppSettings | null> {
    try {
      const row = await db.settings.get(SETTINGS_ID);
      if (!row) return null;
      return JSON.parse(row.settings) as AppSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  },

  async save(settings: AppSettings): Promise<void> {
    try {
      await db.settings.put({
        id: SETTINGS_ID,
        settings: JSON.stringify(settings),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  },

  async reset(): Promise<void> {
    try {
      await db.settings.delete(SETTINGS_ID);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw new Error('Failed to reset settings');
    }
  },
};
