import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import typingReducer from './typingSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    typing: typingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['typing/setEngineState'],
        ignoredPaths: ['typing.engineState'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
