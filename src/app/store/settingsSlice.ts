import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings, AppearanceSettings, TypingSettings, SoundSettings, GeneralSettings } from '@/types';
import { settingsRepository } from '@/services/storage/repositories';
import { cookieService } from '@/services/cookies/cookieService';

export const defaultSettings: AppSettings = {
  appearance: {
    themeId: 'midnight',
    accentColor: '#d4a843',
    fontFamily: 'mono',
    fontSize: 20,
    fontWeight: 400,
    typingAreaWidth: 800,
    lineHeight: 2,
    letterSpacing: 0.5,
    borderRadius: 12,
    animationIntensity: 0.8,
    keyboardVisible: true,
    statsVisible: true,
    compactMode: false,
  },
  typing: {
    caretStyle: 'line',
    caretAnimation: 'smooth',
    smoothCaret: true,
    testStartMode: 'on-first-key',
    backspaceEnabled: true,
    blindMode: false,
    showLiveWpm: true,
    showLiveAccuracy: true,
    showLiveErrors: false,
    showLiveTimer: true,
    showLiveProgress: true,
    showLiveGraph: false,
    autoNextTest: false,
    errorHighlighting: true,
    soundOnCorrect: false,
    soundOnError: true,
  },
  sound: {
    masterEnabled: false,
    typingEnabled: false,
    correctSound: false,
    errorSound: true,
    gameEffects: true,
    achievementSounds: true,
    volume: 0.5,
    soundProfile: 'mechanical',
    muteOnTest: false,
  },
  general: {
    dailyGoalMinutes: 15,
    weeklyGoalMinutes: 60,
    language: 'en',
    sidebarCollapsed: false,
    showOnboarding: true,
  },
};

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: defaultSettings,
  loaded: false,
  loading: false,
  error: null,
};

export const loadSettings = createAsyncThunk('settings/load', async () => {
  const saved = await settingsRepository.get();
  return saved;
});

export const saveSettings = createAsyncThunk('settings/save', async (settings: AppSettings) => {
  await settingsRepository.save(settings);
  // Also sync small preferences to cookies
  cookieService.setTheme(settings.appearance.themeId);
  cookieService.setCompactMode(settings.appearance.compactMode);
  cookieService.setSidebarCollapsed(settings.general.sidebarCollapsed);
  return settings;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAppearance(state, action: PayloadAction<Partial<AppearanceSettings>>) {
      state.settings.appearance = { ...state.settings.appearance, ...action.payload };
    },
    updateTyping(state, action: PayloadAction<Partial<TypingSettings>>) {
      state.settings.typing = { ...state.settings.typing, ...action.payload };
    },
    updateSound(state, action: PayloadAction<Partial<SoundSettings>>) {
      state.settings.sound = { ...state.settings.sound, ...action.payload };
    },
    updateGeneral(state, action: PayloadAction<Partial<GeneralSettings>>) {
      state.settings.general = { ...state.settings.general, ...action.payload };
    },
    resetSettings(state) {
      state.settings = defaultSettings;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        if (action.payload) {
          state.settings = { ...defaultSettings, ...action.payload };
        }
        state.loaded = true;
        state.loading = false;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.error.message || 'Failed to load settings';
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save settings';
      });
  },
});

export const { updateAppearance, updateTyping, updateSound, updateGeneral, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
