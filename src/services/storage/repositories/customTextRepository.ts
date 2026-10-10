import { db } from '../database';
import type { CustomText, CustomWordList } from '@/types';

export const customTextRepository = {
  async save(text: CustomText): Promise<number> {
    try {
      return await db.customTexts.add(text as import('../database').DBCustomText) as number;
    } catch (error) {
      console.error('Failed to save custom text:', error);
      throw new Error('Failed to save custom text');
    }
  },

  async update(id: number, text: Partial<CustomText>): Promise<void> {
    try {
      await db.customTexts.update(id, { ...text, updatedAt: Date.now() });
    } catch (error) {
      console.error('Failed to update custom text:', error);
      throw new Error('Failed to update custom text');
    }
  },

  async getAll(): Promise<CustomText[]> {
    try {
      return await db.customTexts.orderBy('createdAt').reverse().toArray() as CustomText[];
    } catch (error) {
      console.error('Failed to get custom texts:', error);
      return [];
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.customTexts.delete(id);
    } catch (error) {
      console.error('Failed to delete custom text:', error);
      throw new Error('Failed to delete custom text');
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.customTexts.clear();
    } catch (error) {
      console.error('Failed to clear custom texts:', error);
    }
  },
};

export const customWordListRepository = {
  async save(list: CustomWordList): Promise<number> {
    try {
      return await db.customWordLists.add({
        ...list,
        words: JSON.stringify(list.words),
      } as import('../database').DBCustomWordList) as number;
    } catch (error) {
      console.error('Failed to save word list:', error);
      throw new Error('Failed to save word list');
    }
  },

  async getAll(): Promise<CustomWordList[]> {
    try {
      const rows = await db.customWordLists.toArray();
      return rows.map(r => ({
        ...r,
        words: JSON.parse(r.words) as string[],
      })) as CustomWordList[];
    } catch (error) {
      console.error('Failed to get word lists:', error);
      return [];
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.customWordLists.delete(id);
    } catch (error) {
      console.error('Failed to delete word list:', error);
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.customWordLists.clear();
    } catch (error) {
      console.error('Failed to clear word lists:', error);
    }
  },
};
