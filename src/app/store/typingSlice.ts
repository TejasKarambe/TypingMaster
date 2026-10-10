import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TestConfig, TypingResult } from '@/types';

interface TypingState {
  testConfig: TestConfig;
  isTestActive: boolean;
  lastResult: TypingResult | null;
  showResult: boolean;
}

const defaultTestConfig: TestConfig = {
  mode: 'time',
  duration: 60,
  wordCount: 50,
  difficulty: 'medium',
  punctuation: false,
  numbers: false,
  symbols: false,
  capitalization: false,
  language: 'en',
  textSource: 'words',
  quoteLength: 'medium',
};

const initialState: TypingState = {
  testConfig: defaultTestConfig,
  isTestActive: false,
  lastResult: null,
  showResult: false,
};

const typingSlice = createSlice({
  name: 'typing',
  initialState,
  reducers: {
    setTestConfig(state, action: PayloadAction<Partial<TestConfig>>) {
      state.testConfig = { ...state.testConfig, ...action.payload };
    },
    setTestActive(state, action: PayloadAction<boolean>) {
      state.isTestActive = action.payload;
    },
    setLastResult(state, action: PayloadAction<TypingResult | null>) {
      state.lastResult = action.payload;
      state.showResult = action.payload !== null;
    },
    setShowResult(state, action: PayloadAction<boolean>) {
      state.showResult = action.payload;
    },
    resetTestConfig(state) {
      state.testConfig = defaultTestConfig;
    },
  },
});

export const { setTestConfig, setTestActive, setLastResult, setShowResult, resetTestConfig } = typingSlice.actions;
export default typingSlice.reducer;
